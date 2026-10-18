/**
 * Core 3D Endless Runner Game Engine: Jan Tar Runner - The Protest Escape
 * Three-lane physics, dynamic police pursuer, procedural segment recycling, and Three.js PBR rendering.
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  ProtesterCharacter,
  PoliceOfficer,
  createDelhiPoliceBarricade,
  createTrafficConesCluster,
  createFallenPlacardObstacle,
  createOverheadBarrier,
  createPoliceGypsy,
  createAutorickshaw,
  createChaiCart,
  createRupeeCoin,
  createPowerup,
  PowerupType,
  createSamratYantra,
  createRamYantra,
  createDelhiStreetTree,
  createStreetLamppost,
  createCrowdSpectator,
} from './models';
import { getRoadTexture } from './textures';
import { sound } from './audio';

// Constants
export const LANES = [-2.5, 0, 2.5]; // 3 playable lanes: Left, Center, Right
const SEGMENT_LENGTH = 40; // Length of each road chunk
const VISIBLE_SEGMENTS = 7; // Forward render buffer (280m ahead)
const BASE_SPEED = 19; // meters per second
const MAX_SPEED = 34; // max speed after long run
const JUMP_VELOCITY = 13.5;
const GRAVITY = -38;
const SLIDE_DURATION = 0.72; // seconds

export type GameZone = 'Jantar Mantar' | 'New Delhi Streets' | 'Government District';

export interface PowerupState {
  type: PowerupType;
  remainingTime: number;
  duration: number;
}

export interface GameStats {
  score: number;
  distance: number;
  coins: number;
  multiplier: number;
  policeDistance: number; // in meters (0 to 18)
  zone: GameZone;
  speed: number;
  activePowerups: PowerupState[];
}

export interface GameOverDetails {
  score: number;
  distance: number;
  coins: number;
  reason: 'caught' | 'crash';
  isNewHigh: boolean;
}

export class GameEngine {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private clock: THREE.Clock;

  // Actors
  public player: ProtesterCharacter;
  public police: PoliceOfficer;

  // Environment & Chunks
  private roadSegments: THREE.Group[] = [];
  private activeObstacles: THREE.Group[] = [];
  private activeCoins: THREE.Group[] = [];
  private activePowerups: THREE.Group[] = [];
  private activeScenery: THREE.Group[] = [];
  private nextSpawnZ: number = 0;

  // Game Loop State
  public isRunning: boolean = false;
  public isPaused: boolean = false;
  public isGameOver: boolean = false;
  public isTitleScreen: boolean = true;

  // Player Kinematics
  private currentLaneIndex: number = 1; // 0=left, 1=center, 2=right
  private targetX: number = 0;
  private playerX: number = 0;
  private playerY: number = 0;
  private velocityY: number = 0;
  private isGrounded: boolean = true;
  private isJumping: boolean = false;
  private isSliding: boolean = false;
  private slideTimer: number = 0;
  private isStumbling: boolean = false;
  private stumbleTimer: number = 0;

  // Police Chase Dynamics
  private policeDistance: number = 11.0; // Distance behind player (meters)
  private policeTargetX: number = 0;
  private policeX: number = 0;

  // Difficulty & Progression
  private runSpeed: number = BASE_SPEED;
  private totalDistance: number = 0;
  private score: number = 0;
  private coins: number = 0;
  private baseMultiplier: number = 1;
  private activePowerupList: Map<PowerupType, { remaining: number; duration: number }> = new Map();

  // Zone Tracking
  private currentZone: GameZone = 'Jantar Mantar';
  private zoneDistanceCounter: number = 0;

  // Camera & FX
  private cameraShake: number = 0;
  private cameraBaseOffset = new THREE.Vector3(0, 3.8, -6.8);

  // Callbacks
  public onStatsUpdate?: (stats: GameStats) => void;
  public onGameOverCallback?: (details: GameOverDetails) => void;
  public onZoneChange?: (zone: GameZone) => void;

  private animFrameId: number | null = null;
  private boundResize: () => void;
  private boundKeyDown: (e: KeyboardEvent) => void;
  private boundKeyUp: (e: KeyboardEvent) => void;

  constructor(mountContainer: HTMLElement) {
    this.container = mountContainer;
    this.clock = new THREE.Clock();

    // 1. Scene setup with horizon-matched Fog
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x93c5fd); // Delhi morning sky blue
    this.scene.fog = new THREE.FogExp2(0x93c5fd, 0.009);

    // 2. Camera setup
    const aspect = this.container.clientWidth / Math.max(this.container.clientHeight, 1);
    this.camera = new THREE.PerspectiveCamera(62, aspect, 0.1, 400);

    // 3. Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    // 4. Studio Environment Reflection (Mandatory Three.js Skill Directive)
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. Lighting Setup (Key Light + Cool Fill Hemisphere)
    const hemiLight = new THREE.HemisphereLight(0xffedd5, 0x334155, 0.7);
    hemiLight.position.set(0, 50, 0);
    this.scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfff7ed, 1.4);
    dirLight.position.set(20, 35, 15);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 80;
    dirLight.shadow.camera.left = -16;
    dirLight.shadow.camera.right = 16;
    dirLight.shadow.camera.top = 25;
    dirLight.shadow.camera.bottom = -15;
    dirLight.shadow.bias = -0.0005;
    dirLight.shadow.normalBias = 0.02;
    this.scene.add(dirLight);

    // Target light to follow player
    const lightTarget = new THREE.Object3D();
    this.scene.add(lightTarget);
    dirLight.target = lightTarget;

    // 6. Spawn Hero & Chasing Police Officer
    this.player = new ProtesterCharacter();
    this.scene.add(this.player.group);

    this.police = new PoliceOfficer();
    this.scene.add(this.police.group);

    // Initial Road chunks setup
    this.initRoadChunks();

    // Event listeners
    this.boundResize = this.onWindowResize.bind(this);
    this.boundKeyDown = this.handleKeyDown.bind(this);
    this.boundKeyUp = this.handleKeyUp.bind(this);

    window.addEventListener('resize', this.boundResize);
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);

    // Set initial title screen camera posture
    this.setupTitleScreenView();

    // Pre-warm WebGL shaders (Skill directive)
    this.renderer.compile(this.scene, this.camera);

    // Start render loop
    this.tick();
  }

  private setupTitleScreenView() {
    this.player.group.position.set(0, 0, 4);
    this.police.group.position.set(0, 0, -5);
    this.camera.position.set(0, 2.2, 9.5);
    this.camera.lookAt(0, 1.2, 4);
  }

  /**
   * Initialize initial continuous road and environment chunks
   */
  private initRoadChunks() {
    for (let i = 0; i < VISIBLE_SEGMENTS; i++) {
      const segZ = i * SEGMENT_LENGTH;
      this.spawnSegment(segZ, i === 0);
    }
    this.nextSpawnZ = VISIBLE_SEGMENTS * SEGMENT_LENGTH;
  }

  /**
   * Spawn a 40-meter road segment with road mesh, curbs, sidewalk, and zone props
   */
  private spawnSegment(zPos: number, isInitialSafe: boolean) {
    const segment = new THREE.Group();
    segment.position.z = zPos;
    segment.name = `Segment_${zPos}`;

    // Road asphalt surface (width = 9m: 3 lanes of 3m each)
    const roadGeo = new THREE.PlaneGeometry(9.0, SEGMENT_LENGTH);
    roadGeo.rotateX(-Math.PI / 2);

    const roadTex = getRoadTexture();
    const roadMat = new THREE.MeshStandardMaterial({
      map: roadTex,
      roughness: 0.85,
      metalness: 0.1,
    });
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.position.y = 0;
    roadMesh.receiveShadow = true;
    segment.add(roadMesh);

    // Left and Right Pavements / Sidewalks (Sandstone / Concrete)
    const curbGeo = new THREE.BoxGeometry(4.0, 0.25, SEGMENT_LENGTH);
    const curbMat = new THREE.MeshStandardMaterial({
      color: this.currentZone === 'Jantar Mantar' ? 0x9a3412 : 0x475569,
      roughness: 0.9,
    });

    const leftCurb = new THREE.Mesh(curbGeo, curbMat);
    leftCurb.position.set(-6.5, 0.125, 0);
    leftCurb.receiveShadow = true;
    segment.add(leftCurb);

    const rightCurb = new THREE.Mesh(curbGeo, curbMat);
    rightCurb.position.set(6.5, 0.125, 0);
    rightCurb.receiveShadow = true;
    segment.add(rightCurb);

    // Side metal railings along the protest zone
    [-4.6, 4.6].forEach((x) => {
      const fenceRailGeo = new THREE.CylinderGeometry(0.04, 0.04, SEGMENT_LENGTH, 8);
      fenceRailGeo.rotateX(Math.PI / 2);
      const railMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 });
      const fenceRail = new THREE.Mesh(fenceRailGeo, railMat);
      fenceRail.position.set(x, 0.85, 0);
      segment.add(fenceRail);

      for (let pz = -SEGMENT_LENGTH / 2; pz < SEGMENT_LENGTH / 2; pz += 4) {
        const postGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.9, 8);
        const post = new THREE.Mesh(postGeo, railMat);
        post.position.set(x, 0.45, pz);
        segment.add(post);
      }
    });

    // Zone-specific Scenery & Landmarks on flanks
    this.addZoneSceneryToSegment(segment, zPos);

    this.scene.add(segment);
    this.roadSegments.push(segment);

    // Spawn gameplay obstacles and pickups on this segment (if not initial safe start)
    if (!isInitialSafe && this.isRunning) {
      this.populateSegmentGameplay(zPos);
    }
  }

  /**
   * Add background structures, crowds, and trees outside the road
   */
  private addZoneSceneryToSegment(segment: THREE.Group, zPos: number) {
    if (this.currentZone === 'Jantar Mantar') {
      // Jantar Mantar landmark every ~120m
      if (Math.abs(zPos) % 120 < SEGMENT_LENGTH) {
        const sundial = createSamratYantra();
        sundial.position.set(-18, 0, 0);
        sundial.rotation.y = 0.4;
        segment.add(sundial);
      } else if (Math.abs(zPos) % 80 < SEGMENT_LENGTH) {
        const ramYantra = createRamYantra();
        ramYantra.position.set(18, 0, 0);
        segment.add(ramYantra);
      }

      // Peaceful protest crowds waving signs along the sidewalk
      [-7.2, 7.2].forEach((x, sideIdx) => {
        for (let cz = -SEGMENT_LENGTH / 2 + 3; cz < SEGMENT_LENGTH / 2; cz += 6) {
          const crowd = createCrowdSpectator(Math.floor(Math.abs(zPos + cz)));
          crowd.position.set(x + (Math.random() * 0.8 - 0.4), 0.25, cz);
          crowd.rotation.y = sideIdx === 0 ? Math.PI / 2 : -Math.PI / 2;
          segment.add(crowd);
        }
      });
    } else if (this.currentZone === 'New Delhi Streets') {
      // Street trees & lampposts
      for (let sz = -SEGMENT_LENGTH / 2 + 5; sz < SEGMENT_LENGTH / 2; sz += 15) {
        const tree = createDelhiStreetTree();
        tree.position.set(-8.5, 0.25, sz);
        segment.add(tree);

        const lamppost = createStreetLamppost();
        lamppost.position.set(7.5, 0.25, sz);
        lamppost.rotation.y = Math.PI;
        segment.add(lamppost);
      }
    } else {
      // Government District: Grand lampposts, manicured hedges
      for (let gz = -SEGMENT_LENGTH / 2 + 4; gz < SEGMENT_LENGTH / 2; gz += 12) {
        const lampLeft = createStreetLamppost();
        lampLeft.position.set(-7.5, 0.25, gz);
        segment.add(lampLeft);

        const lampRight = createStreetLamppost();
        lampRight.position.set(7.5, 0.25, gz);
        lampRight.rotation.y = Math.PI;
        segment.add(lampRight);
      }
    }
  }

  /**
   * Populate obstacles and collectibles ensuring FAIR, 100% solvable layouts!
   */
  private populateSegmentGameplay(segmentZ: number) {
    // Generate 1 or 2 obstacle rows per 40m segment
    const rows = [segmentZ - 10, segmentZ + 10];

    rows.forEach((rowZ) => {
      // Pick obstacle pattern:
      // Pattern 0: 1 large obstacle in 1 lane, 1 low obstacle in another lane -> 1 lane completely free
      // Pattern 1: 1 overhead barrier across 1 or 2 lanes -> player can slide or switch lane
      // Pattern 2: Coins arc across lanes
      // Pattern 3: Powerup spawn
      const pattern = Math.random();

      // Free lane guarantee: pick at least one safe lane
      const lanePermutations = [0, 1, 2].sort(() => Math.random() - 0.5);
      const blockedLane1 = lanePermutations[0];
      const blockedLane2 = Math.random() > 0.4 ? lanePermutations[1] : -1; // Sometimes 2 lanes blocked, 1 open

      // Spawn Obstacle 1
      this.spawnObstacleAtLane(blockedLane1, rowZ);

      // Spawn Obstacle 2 if difficulty allows
      if (blockedLane2 !== -1 && this.totalDistance > 80) {
        // Guarantee blockedLane2 is either jumpable or slideable so player has options
        this.spawnObstacleAtLane(blockedLane2, rowZ, true);
      }

      // Spawn Rupee coins or Power-ups in the open lane or above jumpable obstacles
      const freeLane = lanePermutations[blockedLane2 !== -1 ? 2 : 1];
      if (Math.random() < 0.75) {
        this.spawnCoinsTrack(freeLane, rowZ - 8, rowZ + 8);
      }

      // Occasional power-up spawn (every ~120m)
      if (Math.random() < 0.18) {
        const powerupTypes: PowerupType[] = ['chai_boost', 'megaphone', 'magnet', 'sneakers'];
        const chosen = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
        const pu = createPowerup(chosen);
        pu.position.set(LANES[freeLane], 1.2, rowZ);
        this.scene.add(pu);
        this.activePowerups.push(pu);
      }
    });
  }

  private spawnObstacleAtLane(laneIndex: number, z: number, forceJumpableOrSlideable = false) {
    let obstacle: THREE.Group;
    const r = Math.random();

    if (forceJumpableOrSlideable) {
      // Either low (barricade / cones / placard) or overhead
      if (r < 0.4) {
        obstacle = createDelhiPoliceBarricade();
      } else if (r < 0.7) {
        obstacle = createTrafficConesCluster();
      } else {
        obstacle = createOverheadBarrier();
      }
    } else {
      if (r < 0.3) {
        obstacle = createDelhiPoliceBarricade();
      } else if (r < 0.55) {
        obstacle = createOverheadBarrier();
      } else if (r < 0.75) {
        obstacle = createPoliceGypsy();
      } else if (r < 0.9) {
        obstacle = createAutorickshaw();
      } else {
        obstacle = createChaiCart();
      }
    }

    obstacle.position.set(LANES[laneIndex], 0, z);
    this.scene.add(obstacle);
    this.activeObstacles.push(obstacle);
  }

  private spawnCoinsTrack(laneIndex: number, startZ: number, endZ: number) {
    const count = 5;
    const step = (endZ - startZ) / count;
    for (let i = 0; i < count; i++) {
      const coin = createRupeeCoin();
      coin.position.set(LANES[laneIndex], 0.9, startZ + i * step);
      this.scene.add(coin);
      this.activeCoins.push(coin);
    }
  }

  /**
   * Start a new game run
   */
  public startGame() {
    this.isTitleScreen = false;
    this.isRunning = true;
    this.isPaused = false;
    this.isGameOver = false;

    // Reset player position & states
    this.currentLaneIndex = 1;
    this.targetX = LANES[1];
    this.playerX = LANES[1];
    this.playerY = 0;
    this.velocityY = 0;
    this.isGrounded = true;
    this.isJumping = false;
    this.isSliding = false;
    this.slideTimer = 0;
    this.isStumbling = false;
    this.stumbleTimer = 0;

    // Reset Chase Dynamics
    this.policeDistance = 11.0;
    this.policeTargetX = LANES[1];
    this.policeX = LANES[1];

    // Reset progression
    this.runSpeed = BASE_SPEED;
    this.totalDistance = 0;
    this.score = 0;
    this.coins = 0;
    this.baseMultiplier = 1;
    this.activePowerupList.clear();
    this.currentZone = 'Jantar Mantar';
    this.zoneDistanceCounter = 0;

    // Clear existing dynamic obstacles & coins
    this.cleanupGameplayEntities();

    // Reset road segments positions around origin
    this.resetRoadChunks();

    // Start background music
    sound.startBGM();
    sound.playWhistle(0.3); // Police whistle sounds at start of chase!
  }

  private cleanupGameplayEntities() {
    this.activeObstacles.forEach((obs) => this.scene.remove(obs));
    this.activeObstacles = [];

    this.activeCoins.forEach((c) => this.scene.remove(c));
    this.activeCoins = [];

    this.activePowerups.forEach((p) => this.scene.remove(p));
    this.activePowerups = [];
  }

  private resetRoadChunks() {
    this.roadSegments.forEach((seg) => this.scene.remove(seg));
    this.roadSegments = [];
    this.initRoadChunks();
  }

  /**
   * Input Controls: Left, Right, Jump, Slide
   */
  public moveLeft() {
    if (!this.isRunning || this.isPaused || this.isGameOver) return;
    if (this.currentLaneIndex > 0) {
      this.currentLaneIndex--;
      this.targetX = LANES[this.currentLaneIndex];
      sound.playLaneSwitch();
    }
  }

  public moveRight() {
    if (!this.isRunning || this.isPaused || this.isGameOver) return;
    if (this.currentLaneIndex < LANES.length - 1) {
      this.currentLaneIndex++;
      this.targetX = LANES[this.currentLaneIndex];
      sound.playLaneSwitch();
    }
  }

  public jump() {
    if (!this.isRunning || this.isPaused || this.isGameOver) return;
    if (this.isGrounded) {
      const hasSneakers = this.activePowerupList.has('sneakers');
      this.velocityY = JUMP_VELOCITY * (hasSneakers ? 1.45 : 1.0);
      this.isGrounded = false;
      this.isJumping = true;
      this.isSliding = false; // Jump cancels slide
      sound.playJump();
    }
  }

  public slide() {
    if (!this.isRunning || this.isPaused || this.isGameOver) return;
    if (!this.isSliding) {
      this.isSliding = true;
      this.slideTimer = SLIDE_DURATION;
      // If jumping, quick drop downwards
      if (!this.isGrounded) {
        this.velocityY = -22;
      }
      sound.playSlide();
    }
  }

  public togglePause(): boolean {
    if (!this.isRunning || this.isGameOver) return false;
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      sound.stopBGM();
    } else {
      sound.startBGM();
    }
    return this.isPaused;
  }

  /**
   * Keyboard event handlers
   */
  private handleKeyDown(e: KeyboardEvent) {
    if (e.repeat) return;

    if (e.code === 'KeyP' || e.code === 'Escape') {
      this.togglePause();
      return;
    }

    if (this.isTitleScreen && (e.code === 'Space' || e.code === 'Enter')) {
      this.startGame();
      return;
    }

    if (!this.isRunning || this.isPaused) return;

    switch (e.code) {
      case 'ArrowLeft':
      case 'KeyA':
        this.moveLeft();
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.moveRight();
        break;
      case 'ArrowUp':
      case 'KeyW':
      case 'Space':
        this.jump();
        break;
      case 'ArrowDown':
      case 'KeyS':
        this.slide();
        break;
    }
  }

  private handleKeyUp(_e: KeyboardEvent) {}

  /**
   * Main per-frame simulation tick
   */
  private tick = () => {
    this.animFrameId = requestAnimationFrame(this.tick);

    const rawDt = this.clock.getDelta();
    const dt = Math.min(rawDt, 0.05); // Three.js skill directive: clamp dt
    const time = this.clock.getElapsedTime();

    if (this.isTitleScreen) {
      this.updateTitleScreen(time, dt);
      this.renderer.render(this.scene, this.camera);
      return;
    }

    if (this.isRunning && !this.isPaused && !this.isGameOver) {
      this.updatePhysics(dt, time);
      this.updateRecycling(dt);
      this.updateCollisions();
      this.updatePowerups(dt);
      this.updateZoneProgression(dt);
      this.updateStats();
    }

    // Camera follow & visual polish
    this.updateCamera(dt, time);

    this.renderer.render(this.scene, this.camera);
  };

  /**
   * Title Screen live-world camera pan (Game Craft directive)
   */
  private updateTitleScreen(time: number, _dt: number) {
    const orbitRadius = 8.5;
    const camX = Math.sin(time * 0.4) * orbitRadius;
    const camZ = 4 + Math.cos(time * 0.4) * orbitRadius;
    this.camera.position.set(camX, 2.5 + Math.sin(time * 0.5) * 0.4, camZ);
    this.camera.lookAt(0, 1.2, 4);

    // Idle animation for characters
    this.player.update(time, 0.3, false, false, false, false);
    this.police.update(time, 0.2, false);
  }

  /**
   * Player Kinematics, Police Pursuer Kinematics, and World Motion
   */
  private updatePhysics(dt: number, time: number) {
    // 1. Advance run speed & distance
    const speedRatio = this.runSpeed / BASE_SPEED;
    this.runSpeed = Math.min(MAX_SPEED, BASE_SPEED + (this.totalDistance / 350) * 1.8);
    sound.setSpeedMultiplier(speedRatio);

    const deltaDist = this.runSpeed * dt;
    this.totalDistance += deltaDist;

    // Score increments based on distance and active multipliers
    const hasMegaphone = this.activePowerupList.has('megaphone');
    const effectiveMultiplier = this.baseMultiplier * (hasMegaphone ? 2 : 1);
    this.score += Math.round(deltaDist * 1.2 * effectiveMultiplier);

    // 2. Smooth Lateral Lane Switching (Exponential damping)
    this.playerX = THREE.MathUtils.damp(this.playerX, this.targetX, 16, dt);
    this.player.group.position.x = this.playerX;

    // Slight dynamic banking roll into turns
    const rollAngle = (this.targetX - this.playerX) * -0.08;
    this.player.group.rotation.z = rollAngle;

    // 3. Jump and Gravity Physics
    if (!this.isGrounded) {
      this.velocityY += GRAVITY * dt;
      this.playerY += this.velocityY * dt;

      if (this.playerY <= 0) {
        this.playerY = 0;
        this.velocityY = 0;
        this.isGrounded = true;
        this.isJumping = false;
      }
    }
    this.player.group.position.y = this.playerY;

    // 4. Slide Duration Timer
    if (this.isSliding) {
      this.slideTimer -= dt;
      if (this.slideTimer <= 0) {
        this.isSliding = false;
      }
    }

    // 5. Stumble recovery timer
    if (this.isStumbling) {
      this.stumbleTimer -= dt;
      if (this.stumbleTimer <= 0) {
        this.isStumbling = false;
      }
    }

    // 6. Update Character articulated joints
    this.player.update(
      time,
      speedRatio,
      this.isJumping,
      this.isSliding,
      this.isStumbling,
      this.isGameOver
    );

    // 7. Police Officer Kinematics & Dynamic Distance
    // Smooth lane tracking with slight latency
    this.policeTargetX = this.targetX;
    this.policeX = THREE.MathUtils.damp(this.policeX, this.policeTargetX, 10, dt);
    this.police.group.position.x = this.policeX;

    // If player is running cleanly without stumbling, police officer gradually drifts back
    if (!this.isStumbling && this.policeDistance < 13.0) {
      this.policeDistance += 0.8 * dt; // slowly gains breathing room
    }

    // Position police behind player on Z axis
    this.police.group.position.z = -this.policeDistance;
    this.police.update(time, speedRatio, this.policeDistance < 3.0);

    // If police is very close (< 4m), play periodic alert whistle / siren
    if (this.policeDistance < 4.0 && Math.random() < 0.03) {
      sound.playPoliceSiren();
    }
  }

  /**
   * Endless world streaming: move all road chunks, obstacles, and pickups towards -Z
   */
  private updateRecycling(dt: number) {
    const shiftZ = this.runSpeed * dt;

    // Move Road Segments
    for (let i = this.roadSegments.length - 1; i >= 0; i--) {
      const seg = this.roadSegments[i];
      seg.position.z -= shiftZ;

      // When segment is far behind camera, recycle it to the front
      if (seg.position.z < -SEGMENT_LENGTH * 1.5) {
        this.scene.remove(seg);
        this.roadSegments.splice(i, 1);

        // Find furthest segment Z
        let maxZ = 0;
        this.roadSegments.forEach((s) => {
          if (s.position.z > maxZ) maxZ = s.position.z;
        });

        this.spawnSegment(maxZ + SEGMENT_LENGTH, false);
      }
    }

    // Move Obstacles
    for (let i = this.activeObstacles.length - 1; i >= 0; i--) {
      const obs = this.activeObstacles[i];
      obs.position.z -= shiftZ;

      if (obs.position.z < -15) {
        this.scene.remove(obs);
        this.activeObstacles.splice(i, 1);
      }
    }

    // Move Coins & rotate them
    const hasMagnet = this.activePowerupList.has('magnet');
    for (let i = this.activeCoins.length - 1; i >= 0; i--) {
      const coin = this.activeCoins[i];
      coin.position.z -= shiftZ;
      coin.rotation.y += 3.5 * dt;

      // Magnet power-up effect: pull coins smoothly towards player
      if (hasMagnet && coin.position.z > -2 && coin.position.z < 12) {
        coin.position.x = THREE.MathUtils.damp(coin.position.x, this.playerX, 12, dt);
        coin.position.y = THREE.MathUtils.damp(coin.position.y, this.playerY + 0.8, 12, dt);
      }

      if (coin.position.z < -10) {
        this.scene.remove(coin);
        this.activeCoins.splice(i, 1);
      }
    }

    // Move Power-ups
    for (let i = this.activePowerups.length - 1; i >= 0; i--) {
      const pu = this.activePowerups[i];
      pu.position.z -= shiftZ;
      pu.rotation.y += 2.0 * dt;
      pu.position.y = 1.2 + Math.sin(this.clock.getElapsedTime() * 4) * 0.15;

      if (pu.position.z < -10) {
        this.scene.remove(pu);
        this.activePowerups.splice(i, 1);
      }
    }
  }

  /**
   * Precise 3D Collision Detection with Lane Geometry
   */
  private updateCollisions() {
    const pX = this.playerX;
    const pY = this.playerY;
    const hasShield = this.activePowerupList.has('chai_boost');

    // 1. Check Obstacles
    for (let i = 0; i < this.activeObstacles.length; i++) {
      const obs = this.activeObstacles[i];
      const oZ = obs.position.z;

      // Collision window along Z axis
      if (oZ > -0.8 && oZ < 1.4) {
        const oX = obs.position.x;
        const xDist = Math.abs(pX - oX);
        const data = obs.userData;

        // If player is in same lane (lateral threshold ~1.1m)
        if (xDist < 1.1) {
          if (data.type === 'low') {
            // Low obstacle (barricade, cone, placard)
            // Can be jumped over! (if playerY > 0.9m, jump clears it!)
            if (pY < 0.85) {
              if (hasShield) {
                // Shield destroys obstacle safely
                this.scene.remove(obs);
                this.activeObstacles.splice(i, 1);
                sound.playPowerup();
                this.cameraShake = 0.3;
                return;
              }
              // Soft hit -> Stumble!
              this.triggerStumble();
            }
          } else if (data.type === 'overhead') {
            // Overhead obstacle (overhead barrier)
            // Must slide under! If NOT sliding (or player is jumping), hits head!
            if (!this.isSliding || pY > 0.3) {
              if (hasShield) {
                this.scene.remove(obs);
                this.activeObstacles.splice(i, 1);
                sound.playPowerup();
                return;
              }
              this.triggerStumble();
            }
          } else if (data.type === 'large') {
            // Large obstacle (Police Gypsy, Auto, Chai Cart)
            // Cannot jump or slide through!
            if (hasShield) {
              // Destroy with shield
              this.scene.remove(obs);
              this.activeObstacles.splice(i, 1);
              sound.playCrash();
              this.cameraShake = 0.4;
              return;
            }
            // Hard crash -> Game Over!
            this.triggerGameOver('crash');
            return;
          }
        }
      }
    }

    // 2. Check Coins Pickup
    for (let i = this.activeCoins.length - 1; i >= 0; i--) {
      const coin = this.activeCoins[i];
      const dist = Math.hypot(pX - coin.position.x, pY + 0.8 - coin.position.y, coin.position.z);

      if (dist < 1.25) {
        this.coins++;
        this.score += 50;
        sound.playCoin();
        this.scene.remove(coin);
        this.activeCoins.splice(i, 1);
      }
    }

    // 3. Check Power-ups Pickup
    for (let i = this.activePowerups.length - 1; i >= 0; i--) {
      const pu = this.activePowerups[i];
      const dist = Math.hypot(pX - pu.position.x, pY + 0.8 - pu.position.y, pu.position.z);

      if (dist < 1.4) {
        const pType = pu.userData.powerupType as PowerupType;
        this.activatePowerup(pType);
        sound.playPowerup();
        this.scene.remove(pu);
        this.activePowerups.splice(i, 1);
      }
    }
  }

  private triggerStumble() {
    if (this.isStumbling) return;

    this.isStumbling = true;
    this.stumbleTimer = 0.85;
    this.cameraShake = 0.55;
    sound.playStumble();

    // Police officer surges closer!
    this.policeDistance -= 5.0;

    // If police officer catches up completely -> caught!
    if (this.policeDistance <= 1.2) {
      this.triggerGameOver('caught');
    }
  }

  private activatePowerup(type: PowerupType) {
    const duration = type === 'chai_boost' ? 6.5 : type === 'megaphone' ? 12.0 : 10.0;
    this.activePowerupList.set(type, {
      remaining: duration,
      duration: duration,
    });
  }

  private updatePowerups(dt: number) {
    for (const [type, state] of this.activePowerupList.entries()) {
      state.remaining -= dt;
      if (state.remaining <= 0) {
        this.activePowerupList.delete(type);
      }
    }
  }

  private updateZoneProgression(_dt: number) {
    this.zoneDistanceCounter += this.runSpeed * _dt;

    // Transition zones every 450 meters
    if (this.zoneDistanceCounter > 450) {
      this.zoneDistanceCounter = 0;
      if (this.currentZone === 'Jantar Mantar') {
        this.currentZone = 'New Delhi Streets';
      } else if (this.currentZone === 'New Delhi Streets') {
        this.currentZone = 'Government District';
      } else {
        this.currentZone = 'Jantar Mantar';
      }
      this.onZoneChange?.(this.currentZone);
    }
  }

  private triggerGameOver(reason: 'caught' | 'crash') {
    this.isGameOver = true;
    this.isRunning = false;
    sound.stopBGM();
    sound.playCrash();

    // Check high score
    const bestScore = parseInt(localStorage.getItem('jantar_runner_highscore') || '0', 10);
    const isNewHigh = this.score > bestScore;
    if (isNewHigh) {
      localStorage.setItem('jantar_runner_highscore', String(this.score));
    }

    this.onGameOverCallback?.({
      score: this.score,
      distance: Math.floor(this.totalDistance),
      coins: this.coins,
      reason,
      isNewHigh,
    });
  }

  private updateStats() {
    const powerups: PowerupState[] = [];
    for (const [type, s] of this.activePowerupList.entries()) {
      powerups.push({
        type,
        remainingTime: s.remaining,
        duration: s.duration,
      });
    }

    this.onStatsUpdate?.({
      score: this.score,
      distance: Math.floor(this.totalDistance),
      coins: this.coins,
      multiplier: this.baseMultiplier * (this.activePowerupList.has('megaphone') ? 2 : 1),
      policeDistance: Math.max(0, this.policeDistance),
      zone: this.currentZone,
      speed: Math.round(this.runSpeed),
      activePowerups: powerups,
    });
  }

  /**
   * Dynamic Camera Follow with gentle damping, sway, and hitstop shake
   */
  private updateCamera(dt: number, time: number) {
    if (this.isGameOver) {
      // Cinematic Game Over camera: pivots to side-front showing police catching the protester
      const targetCamPos = new THREE.Vector3(2.5, 1.8, 3.2);
      this.camera.position.lerp(targetCamPos, dt * 3.5);
      this.camera.lookAt(0, 1.0, 0);
      return;
    }

    // Follow camera: slightly behind player with smooth lateral damping
    const targetX = this.playerX * 0.45;
    const targetY = 3.6 + (this.playerY > 0 ? this.playerY * 0.35 : 0);
    const targetZ = -6.8;

    this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, targetX, 10, dt);
    this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, targetY, 8, dt);
    this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, targetZ, 8, dt);

    // Camera shake decay (Three.js Skill directive)
    if (this.cameraShake > 0.001) {
      this.camera.position.x += (Math.random() - 0.5) * this.cameraShake;
      this.camera.position.y += (Math.random() - 0.5) * this.cameraShake;
      this.cameraShake = THREE.MathUtils.damp(this.cameraShake, 0, 8, dt);
    }

    // Look slightly ahead of player
    this.camera.lookAt(this.playerX * 0.5, 1.4 + this.playerY * 0.3, 8.0);
  }

  private onWindowResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / Math.max(height, 1);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public dispose() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    sound.stopBGM();
    window.removeEventListener('resize', this.boundResize);
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);

    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}
