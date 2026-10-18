/**
 * 3D Procedural Models & Kinematics for Jan Tar Runner
 * Compliant with Three.js Skill: 3-12 part composite groups, varied roughness/metalness, bottom-center pivots.
 */

import * as THREE from 'three';
import {
  getBarricadeTexture,
  getPlacardTexture,
  getSandstoneTexture,
  getPoliceDoorTexture,
  getAutorickshawTexture,
  getCoinTexture,
} from './textures';

// Shared materials cache to minimize draw calls and shader programs
class MaterialLibrary {
  public skin: THREE.MeshStandardMaterial;
  public hair: THREE.MeshStandardMaterial;
  public shirt: THREE.MeshStandardMaterial;
  public jeans: THREE.MeshStandardMaterial;
  public sneakers: THREE.MeshStandardMaterial;
  public backpack: THREE.MeshStandardMaterial;
  public policeKhaki: THREE.MeshStandardMaterial;
  public policeBelt: THREE.MeshStandardMaterial;
  public policeCapBand: THREE.MeshStandardMaterial;
  public brass: THREE.MeshStandardMaterial;
  public metalSteel: THREE.MeshStandardMaterial;
  public yellowHazard: THREE.MeshStandardMaterial;
  public redHazard: THREE.MeshStandardMaterial;
  public darkRubber: THREE.MeshStandardMaterial;
  public sandstone: THREE.MeshStandardMaterial;
  public autoGreen: THREE.MeshStandardMaterial;
  public autoYellow: THREE.MeshStandardMaterial;
  public carPaintWhite: THREE.MeshStandardMaterial;
  public glass: THREE.MeshPhysicalMaterial;
  public wood: THREE.MeshStandardMaterial;
  public coinGold: THREE.MeshStandardMaterial;
  public blueLightEmissive: THREE.MeshStandardMaterial;
  public redLightEmissive: THREE.MeshStandardMaterial;
  public chaiClay: THREE.MeshStandardMaterial;

  constructor() {
    this.skin = new THREE.MeshStandardMaterial({
      color: 0x9e6547,
      roughness: 0.75,
      metalness: 0.05,
    });

    this.hair = new THREE.MeshStandardMaterial({
      color: 0x1c1917,
      roughness: 0.9,
      metalness: 0.0,
    });

    this.shirt = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Vibrant Delhi youth teal-blue
      roughness: 0.65,
      metalness: 0.05,
    });

    this.jeans = new THREE.MeshStandardMaterial({
      color: 0x1e3a5f, // Denim indigo
      roughness: 0.8,
      metalness: 0.05,
    });

    this.sneakers = new THREE.MeshStandardMaterial({
      color: 0xdc2626, // Red & white sneakers
      roughness: 0.5,
      metalness: 0.1,
    });

    this.backpack = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // Dark slate backpack with orange zip
      roughness: 0.6,
      metalness: 0.1,
    });

    this.policeKhaki = new THREE.MeshStandardMaterial({
      color: 0xc2a677, // Authentic Delhi Police Khaki
      roughness: 0.8,
      metalness: 0.02,
    });

    this.policeBelt = new THREE.MeshStandardMaterial({
      color: 0x271913,
      roughness: 0.4,
      metalness: 0.15,
    });

    this.policeCapBand = new THREE.MeshStandardMaterial({
      color: 0x831843, // Deep crimson ribbon on police cap
      roughness: 0.6,
      metalness: 0.1,
    });

    this.brass = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.25,
      metalness: 0.85,
    });

    this.metalSteel = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.35,
      metalness: 0.75,
    });

    this.yellowHazard = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.4,
      metalness: 0.1,
    });

    this.redHazard = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.4,
      metalness: 0.1,
    });

    this.darkRubber = new THREE.MeshStandardMaterial({
      color: 0x1e2022,
      roughness: 0.9,
      metalness: 0.05,
    });

    this.sandstone = new THREE.MeshStandardMaterial({
      map: getSandstoneTexture(),
      roughness: 0.88,
      metalness: 0.05,
    });

    this.autoGreen = new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.4,
      metalness: 0.1,
    });

    this.autoYellow = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      roughness: 0.35,
      metalness: 0.15,
    });

    this.carPaintWhite = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.25,
      metalness: 0.3,
    });

    this.glass = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.85,
      opacity: 0.9,
      transparent: true,
      roughness: 0.1,
      ior: 1.5,
    });

    this.wood = new THREE.MeshStandardMaterial({
      color: 0x78350f,
      roughness: 0.85,
      metalness: 0.05,
    });

    this.coinGold = new THREE.MeshStandardMaterial({
      map: getCoinTexture(),
      roughness: 0.2,
      metalness: 0.85,
    });

    this.blueLightEmissive = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 2.0,
      roughness: 0.2,
    });

    this.redLightEmissive = new THREE.MeshStandardMaterial({
      color: 0xf87171,
      emissive: 0xdc2626,
      emissiveIntensity: 2.0,
      roughness: 0.2,
    });

    this.chaiClay = new THREE.MeshStandardMaterial({
      color: 0xa16207,
      roughness: 0.9,
      metalness: 0.05,
    });
  }
}

export const materials = new MaterialLibrary();

// Reusable scratch vectors to ensure zero GC during animation loop
const _v1 = new THREE.Vector3();

/**
 * 1. HERO PROTESTER CHARACTER
 * Composite 10-part articulated character with fluid running, jumping, sliding, and stumble kinematics.
 */
export class ProtesterCharacter {
  public group: THREE.Group;
  public pelvis: THREE.Group;
  public torso: THREE.Mesh;
  public backpack: THREE.Mesh;
  public head: THREE.Group;
  public leftArm: THREE.Group;
  public rightArm: THREE.Group;
  public leftLeg: THREE.Group;
  public rightLeg: THREE.Group;
  public leftLowerLeg: THREE.Mesh;
  public rightLowerLeg: THREE.Mesh;
  public shadowMesh: THREE.Mesh;

  public state: 'idle' | 'run' | 'jump' | 'slide' | 'stumble' | 'caught' = 'idle';

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'HeroProtester';

    // Root pelvis
    this.pelvis = new THREE.Group();
    this.pelvis.position.y = 0.95;
    this.group.add(this.pelvis);

    // 1. Torso
    const torsoGeo = new THREE.BoxGeometry(0.48, 0.58, 0.28);
    this.torso = new THREE.Mesh(torsoGeo, materials.shirt);
    this.torso.position.y = 0.29;
    this.torso.castShadow = true;
    this.pelvis.add(this.torso);

    // 2. Backpack
    const backpackGeo = new THREE.BoxGeometry(0.36, 0.44, 0.18);
    this.backpack = new THREE.Mesh(backpackGeo, materials.backpack);
    this.backpack.position.set(0, 0.3, -0.21);
    this.backpack.castShadow = true;
    this.pelvis.add(this.backpack);

    // Orange zipper stripe on backpack
    const zipGeo = new THREE.BoxGeometry(0.04, 0.36, 0.02);
    const zipMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.4 });
    const zip = new THREE.Mesh(zipGeo, zipMat);
    zip.position.set(0, 0, -0.1);
    this.backpack.add(zip);

    // 3. Head & Hair
    this.head = new THREE.Group();
    this.head.position.set(0, 0.65, 0);

    const headGeo = new THREE.SphereGeometry(0.2, 16, 16);
    headGeo.scale(0.9, 1.05, 0.95);
    const headMesh = new THREE.Mesh(headGeo, materials.skin);
    headMesh.castShadow = true;
    this.head.add(headMesh);

    // Hair
    const hairGeo = new THREE.BoxGeometry(0.38, 0.16, 0.4);
    const hairMesh = new THREE.Mesh(hairGeo, materials.hair);
    hairMesh.position.set(0, 0.12, -0.02);
    this.head.add(hairMesh);

    // Protest bandana / headband (tricolor motif)
    const bandGeo = new THREE.TorusGeometry(0.205, 0.022, 8, 24);
    bandGeo.rotateX(Math.PI / 2);
    const bandMat = new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.7 });
    const bandMesh = new THREE.Mesh(bandGeo, bandMat);
    bandMesh.position.y = 0.08;
    this.head.add(bandMesh);

    this.pelvis.add(this.head);

    // 4. Arms (Upper & Forearm combined with hand)
    const armGeo = new THREE.CylinderGeometry(0.065, 0.06, 0.48, 8);
    armGeo.translate(0, -0.24, 0);

    // Left Arm
    this.leftArm = new THREE.Group();
    this.leftArm.position.set(-0.32, 0.52, 0);
    const leftArmMesh = new THREE.Mesh(armGeo, materials.skin);
    leftArmMesh.castShadow = true;
    this.leftArm.add(leftArmMesh);
    this.pelvis.add(this.leftArm);

    // Right Arm
    this.rightArm = new THREE.Group();
    this.rightArm.position.set(0.32, 0.52, 0);
    const rightArmMesh = new THREE.Mesh(armGeo, materials.skin);
    rightArmMesh.castShadow = true;
    this.rightArm.add(rightArmMesh);
    this.pelvis.add(this.rightArm);

    // 5. Legs (Hip joint -> Thigh -> Calf -> Sneaker)
    const thighGeo = new THREE.CylinderGeometry(0.09, 0.075, 0.48, 8);
    thighGeo.translate(0, -0.24, 0);

    const calfGeo = new THREE.CylinderGeometry(0.07, 0.06, 0.45, 8);
    calfGeo.translate(0, -0.22, 0);

    const sneakerGeo = new THREE.BoxGeometry(0.14, 0.12, 0.28);
    sneakerGeo.translate(0, 0.06, 0.06);

    // Left Leg
    this.leftLeg = new THREE.Group();
    this.leftLeg.position.set(-0.16, 0, 0);
    const leftThigh = new THREE.Mesh(thighGeo, materials.jeans);
    leftThigh.castShadow = true;
    this.leftLeg.add(leftThigh);

    this.leftLowerLeg = new THREE.Mesh(calfGeo, materials.jeans);
    this.leftLowerLeg.position.set(0, -0.46, 0);
    this.leftLowerLeg.castShadow = true;
    const leftSneaker = new THREE.Mesh(sneakerGeo, materials.sneakers);
    leftSneaker.position.set(0, -0.42, 0);
    leftSneaker.castShadow = true;
    this.leftLowerLeg.add(leftSneaker);
    this.leftLeg.add(this.leftLowerLeg);
    this.pelvis.add(this.leftLeg);

    // Right Leg
    this.rightLeg = new THREE.Group();
    this.rightLeg.position.set(0.16, 0, 0);
    const rightThigh = new THREE.Mesh(thighGeo, materials.jeans);
    rightThigh.castShadow = true;
    this.rightLeg.add(rightThigh);

    this.rightLowerLeg = new THREE.Mesh(calfGeo, materials.jeans);
    this.rightLowerLeg.position.set(0, -0.46, 0);
    this.rightLowerLeg.castShadow = true;
    const rightSneaker = new THREE.Mesh(sneakerGeo, materials.sneakers);
    rightSneaker.position.set(0, -0.42, 0);
    rightSneaker.castShadow = true;
    this.rightLowerLeg.add(rightSneaker);
    this.rightLeg.add(this.rightLowerLeg);
    this.pelvis.add(this.rightLeg);

    // Ground Contact Shadow plane (Three.js Directive: prevents floating appearance)
    const shadowGeo = new THREE.PlaneGeometry(1.0, 1.0);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 64;
    shadowCanvas.height = 64;
    const sCtx = shadowCanvas.getContext('2d')!;
    const grad = sCtx.createRadialGradient(32, 32, 4, 32, 32, 30);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 64, 64);
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);

    this.shadowMesh = new THREE.Mesh(
      shadowGeo,
      new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        depthWrite: false,
        opacity: 0.6,
      })
    );
    this.shadowMesh.position.y = 0.02; // Just above road
    this.group.add(this.shadowMesh);
  }

  /**
   * Update character articulated animations
   */
  public update(time: number, speedRatio: number, isJumping: boolean, isSliding: boolean, isStumbling: boolean, isCaught: boolean) {
    if (isCaught) {
      this.state = 'caught';
      this.pelvis.position.y = 0.85;
      this.pelvis.rotation.set(0, 0.4, 0);
      this.leftArm.rotation.set(-2.2, 0.3, -0.5); // Hands up surrender
      this.rightArm.rotation.set(-2.2, -0.3, 0.5);
      this.leftLeg.rotation.set(0.2, 0, 0);
      this.rightLeg.rotation.set(-0.2, 0, 0);
      this.shadowMesh.scale.set(1, 1, 1);
      return;
    }

    if (isStumbling) {
      this.state = 'stumble';
      const stumbleCycle = Math.sin(time * 24);
      this.pelvis.position.y = 0.82 + Math.abs(stumbleCycle) * 0.1;
      this.pelvis.rotation.z = stumbleCycle * 0.25;
      this.pelvis.rotation.x = 0.3;
      this.leftArm.rotation.set(-1.4, -0.6, -0.8);
      this.rightArm.rotation.set(1.4, 0.6, 0.8);
      return;
    }

    if (isSliding) {
      this.state = 'slide';
      this.pelvis.position.y = 0.38; // Duck down low to clear overhead barriers
      this.pelvis.rotation.x = -0.7; // Lean back in slide
      this.pelvis.rotation.z = 0.15;
      this.leftLeg.rotation.set(1.4, 0.2, 0); // Extended forward slide
      this.rightLeg.rotation.set(0.8, -0.2, 0);
      this.leftArm.rotation.set(0.8, 0, 0.4);
      this.rightArm.rotation.set(-0.8, 0, -0.4);
      this.shadowMesh.scale.set(1.4, 1.4, 1.4);
      return;
    }

    if (isJumping) {
      this.state = 'jump';
      this.pelvis.position.y = 0.95;
      this.pelvis.rotation.x = 0.2;
      this.pelvis.rotation.z = 0;
      // Tuck legs
      this.leftLeg.rotation.set(-0.7, 0, -0.1);
      this.rightLeg.rotation.set(-0.8, 0, 0.1);
      this.leftLowerLeg.rotation.set(0.9, 0, 0);
      this.rightLowerLeg.rotation.set(0.9, 0, 0);
      // Arms raised high for athletic balance
      this.leftArm.rotation.set(-2.0, 0.2, -0.4);
      this.rightArm.rotation.set(-2.0, -0.2, 0.4);
      return;
    }

    // Standard high-speed running cycle
    this.state = 'run';
    const runFreq = 16 * speedRatio;
    const runCycle = Math.sin(time * runFreq);
    const cosCycle = Math.cos(time * runFreq);

    // Vertical bob and torso lean
    this.pelvis.position.y = 0.95 + Math.abs(runCycle) * 0.08;
    this.pelvis.rotation.x = 0.18; // Athletic forward lean
    this.pelvis.rotation.y = runCycle * 0.1;
    this.pelvis.rotation.z = cosCycle * 0.04;

    // Leg pendulum swing
    this.leftLeg.rotation.x = runCycle * 0.85;
    this.rightLeg.rotation.x = -runCycle * 0.85;

    // Knee flex on back-kick
    this.leftLowerLeg.rotation.x = runCycle > 0 ? runCycle * 0.9 : 0.1;
    this.rightLowerLeg.rotation.x = runCycle < 0 ? -runCycle * 0.9 : 0.1;

    // Arm opposite swing
    this.leftArm.rotation.x = -runCycle * 1.0;
    this.rightArm.rotation.x = runCycle * 1.0;
    this.leftArm.rotation.z = -0.2;
    this.rightArm.rotation.z = 0.2;

    // Backpack jiggle
    this.backpack.position.y = 0.3 + Math.abs(cosCycle) * 0.03;

    // Contact shadow follows ground
    this.shadowMesh.scale.set(1.0 - Math.abs(runCycle) * 0.1, 1.0 - Math.abs(runCycle) * 0.1, 1.0);
  }
}

/**
 * 2. CHASING POLICE OFFICER ("Delhi Police")
 * Khaki uniform, peaked cap, dark belt, animated pursuing behind the runner.
 */
export class PoliceOfficer {
  public group: THREE.Group;
  public pelvis: THREE.Group;
  public torso: THREE.Mesh;
  public head: THREE.Group;
  public cap: THREE.Group;
  public leftArm: THREE.Group;
  public rightArm: THREE.Group;
  public leftLeg: THREE.Group;
  public rightLeg: THREE.Group;
  public shadowMesh: THREE.Mesh;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'ChasingPoliceOfficer';

    this.pelvis = new THREE.Group();
    this.pelvis.position.y = 1.0;
    this.group.add(this.pelvis);

    // 1. Torso in Delhi Police Khaki uniform
    const torsoGeo = new THREE.BoxGeometry(0.54, 0.62, 0.32);
    this.torso = new THREE.Mesh(torsoGeo, materials.policeKhaki);
    this.torso.position.y = 0.31;
    this.torso.castShadow = true;
    this.pelvis.add(this.torso);

    // Leather Duty Belt with brass buckle
    const beltGeo = new THREE.BoxGeometry(0.56, 0.1, 0.34);
    const belt = new THREE.Mesh(beltGeo, materials.policeBelt);
    belt.position.y = -0.22;
    this.torso.add(belt);

    const buckleGeo = new THREE.BoxGeometry(0.12, 0.11, 0.04);
    const buckle = new THREE.Mesh(buckleGeo, materials.brass);
    buckle.position.set(0, 0, 0.18);
    belt.add(buckle);

    // Baton / Lathi in hand
    const lathiGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.8, 8);
    const lathiMat = new THREE.MeshStandardMaterial({ color: 0x5a2d0c, roughness: 0.8 });
    const lathi = new THREE.Mesh(lathiGeo, lathiMat);
    lathi.rotation.x = Math.PI / 2;
    lathi.position.set(0, -0.3, 0.2);

    // 2. Head & Peaked Cap
    this.head = new THREE.Group();
    this.head.position.set(0, 0.72, 0);

    const headGeo = new THREE.SphereGeometry(0.21, 16, 16);
    headGeo.scale(0.92, 1.05, 0.95);
    const headMesh = new THREE.Mesh(headGeo, materials.skin);
    headMesh.castShadow = true;
    this.head.add(headMesh);

    // Delhi Police Cap
    this.cap = new THREE.Group();
    this.cap.position.set(0, 0.14, -0.02);

    // Cap crown
    const capCrownGeo = new THREE.CylinderGeometry(0.24, 0.21, 0.12, 16);
    const capCrown = new THREE.Mesh(capCrownGeo, materials.policeKhaki);
    this.cap.add(capCrown);

    // Crimson ribbon band
    const ribbonGeo = new THREE.CylinderGeometry(0.215, 0.215, 0.04, 16);
    const ribbon = new THREE.Mesh(ribbonGeo, materials.policeCapBand);
    ribbon.position.y = -0.04;
    this.cap.add(ribbon);

    // Cap visor (black leather peak)
    const visorGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.02, 16, 1, false, 0, Math.PI);
    visorGeo.rotateX(0.2);
    const visor = new THREE.Mesh(visorGeo, materials.policeBelt);
    visor.position.set(0, -0.05, 0.12);
    this.cap.add(visor);

    // Police brass star badge on front of cap
    const badgeGeo = new THREE.OctahedronGeometry(0.04, 0);
    const badge = new THREE.Mesh(badgeGeo, materials.brass);
    badge.position.set(0, -0.02, 0.22);
    this.cap.add(badge);

    this.head.add(this.cap);
    this.pelvis.add(this.head);

    // 3. Arms
    const armGeo = new THREE.CylinderGeometry(0.075, 0.07, 0.52, 8);
    armGeo.translate(0, -0.26, 0);

    this.leftArm = new THREE.Group();
    this.leftArm.position.set(-0.36, 0.54, 0);
    const leftArmMesh = new THREE.Mesh(armGeo, materials.policeKhaki);
    leftArmMesh.castShadow = true;
    this.leftArm.add(leftArmMesh);
    this.pelvis.add(this.leftArm);

    this.rightArm = new THREE.Group();
    this.rightArm.position.set(0.36, 0.54, 0);
    const rightArmMesh = new THREE.Mesh(armGeo, materials.policeKhaki);
    rightArmMesh.castShadow = true;
    this.rightArm.add(rightArmMesh);
    this.rightArm.add(lathi); // Holds lathi
    this.pelvis.add(this.rightArm);

    // 4. Legs
    const legGeo = new THREE.CylinderGeometry(0.095, 0.08, 0.9, 8);
    legGeo.translate(0, -0.45, 0);

    this.leftLeg = new THREE.Group();
    this.leftLeg.position.set(-0.17, 0, 0);
    const leftLegMesh = new THREE.Mesh(legGeo, materials.policeKhaki);
    leftLegMesh.castShadow = true;
    this.leftLeg.add(leftLegMesh);
    // Black boot
    const bootGeo = new THREE.BoxGeometry(0.15, 0.14, 0.3);
    bootGeo.translate(0, 0.07, 0.06);
    const leftBoot = new THREE.Mesh(bootGeo, materials.policeBelt);
    leftBoot.position.set(0, -0.9, 0);
    this.leftLeg.add(leftBoot);
    this.pelvis.add(this.leftLeg);

    this.rightLeg = new THREE.Group();
    this.rightLeg.position.set(0.17, 0, 0);
    const rightLegMesh = new THREE.Mesh(legGeo, materials.policeKhaki);
    rightLegMesh.castShadow = true;
    this.rightLeg.add(rightLegMesh);
    const rightBoot = new THREE.Mesh(bootGeo, materials.policeBelt);
    rightBoot.position.set(0, -0.9, 0);
    this.rightLeg.add(rightBoot);
    this.pelvis.add(this.rightLeg);

    // Ground Contact Shadow
    const shadowGeo = new THREE.PlaneGeometry(1.1, 1.1);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 64;
    shadowCanvas.height = 64;
    const sCtx = shadowCanvas.getContext('2d')!;
    const grad = sCtx.createRadialGradient(32, 32, 4, 32, 32, 30);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 64, 64);
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);

    this.shadowMesh = new THREE.Mesh(
      shadowGeo,
      new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        depthWrite: false,
        opacity: 0.6,
      })
    );
    this.shadowMesh.position.y = 0.02;
    this.group.add(this.shadowMesh);
  }

  public update(time: number, speedRatio: number, isGrabbing: boolean) {
    if (isGrabbing) {
      // Reaching forward to catch player
      this.pelvis.position.y = 0.95;
      this.pelvis.rotation.x = 0.35;
      this.leftArm.rotation.set(-1.8, 0.2, 0);
      this.rightArm.rotation.set(-1.8, -0.2, 0);
      return;
    }

    const runFreq = 16 * speedRatio;
    const runCycle = Math.sin(time * runFreq);

    this.pelvis.position.y = 1.0 + Math.abs(runCycle) * 0.07;
    this.pelvis.rotation.x = 0.15; // Running stance
    this.pelvis.rotation.y = runCycle * 0.08;

    this.leftLeg.rotation.x = runCycle * 0.8;
    this.rightLeg.rotation.x = -runCycle * 0.8;

    this.leftArm.rotation.x = -runCycle * 0.9;
    this.rightArm.rotation.x = runCycle * 0.9 - 0.3; // Holds lathi up
  }
}

/**
 * 3. OBSTACLES BUILDERS
 */

/**
 * Low Obstacle 1: Delhi Police Steel Barricade (Yellow/Red hazard with stenciled text)
 */
export function createDelhiPoliceBarricade(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Obstacle_Barricade';

  // Main banner board
  const boardGeo = new THREE.BoxGeometry(2.3, 0.7, 0.08);
  const barricadeMat = new THREE.MeshStandardMaterial({
    map: getBarricadeTexture(),
    roughness: 0.45,
    metalness: 0.2,
  });
  const board = new THREE.Mesh(boardGeo, barricadeMat);
  board.position.y = 0.75;
  board.castShadow = true;
  group.add(board);

  // Top and bottom tubular steel rails
  const railGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.4, 12);
  railGeo.rotateZ(Math.PI / 2);

  const topRail = new THREE.Mesh(railGeo, materials.yellowHazard);
  topRail.position.set(0, 1.15, 0);
  topRail.castShadow = true;
  group.add(topRail);

  const bottomRail = new THREE.Mesh(railGeo, materials.yellowHazard);
  bottomRail.position.set(0, 0.35, 0);
  bottomRail.castShadow = true;
  group.add(bottomRail);

  // A-frame side legs and support wheels
  [-1.05, 1.05].forEach((x) => {
    const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.25, 12);
    const legLeft = new THREE.Mesh(legGeo, materials.metalSteel);
    legLeft.position.set(x, 0.6, 0.2);
    legLeft.rotation.x = 0.25;
    legLeft.castShadow = true;
    group.add(legLeft);

    const legRight = new THREE.Mesh(legGeo, materials.metalSteel);
    legRight.position.set(x, 0.6, -0.2);
    legRight.rotation.x = -0.25;
    legRight.castShadow = true;
    group.add(legRight);

    // Base crossbar with wheels
    const baseBarGeo = new THREE.BoxGeometry(0.08, 0.04, 0.65);
    const baseBar = new THREE.Mesh(baseBarGeo, materials.metalSteel);
    baseBar.position.set(x, 0.08, 0);
    group.add(baseBar);

    // Castor wheel
    const wheelGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.05, 12);
    wheelGeo.rotateZ(Math.PI / 2);
    const wheel = new THREE.Mesh(wheelGeo, materials.darkRubber);
    wheel.position.set(x, 0.06, 0);
    group.add(wheel);
  });

  // Hitbox data
  group.userData = {
    type: 'low',
    height: 1.2,
    width: 2.3,
    depth: 0.6,
  };

  return group;
}

/**
 * Low Obstacle 2: Traffic Cones Cluster (Jumpable)
 */
export function createTrafficConesCluster(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Obstacle_TrafficCones';

  const conePositions = [
    { x: -0.6, z: 0 },
    { x: 0, z: 0.15 },
    { x: 0.6, z: -0.1 },
  ];

  conePositions.forEach((pos) => {
    const coneGroup = new THREE.Group();
    coneGroup.position.set(pos.x, 0, pos.z);

    // Square rubber base
    const baseGeo = new THREE.BoxGeometry(0.42, 0.05, 0.42);
    const base = new THREE.Mesh(baseGeo, materials.darkRubber);
    base.position.y = 0.025;
    coneGroup.add(base);

    // Orange cone
    const coneGeo = new THREE.ConeGeometry(0.18, 0.72, 16);
    coneGeo.translate(0, 0.36, 0);
    const cone = new THREE.Mesh(coneGeo, materials.redHazard);
    cone.castShadow = true;
    coneGroup.add(cone);

    // White reflective band
    const bandGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.14, 16);
    const bandMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
    const band = new THREE.Mesh(bandGeo, bandMat);
    band.position.y = 0.38;
    coneGroup.add(band);

    group.add(coneGroup);
  });

  group.userData = {
    type: 'low',
    height: 0.8,
    width: 1.8,
    depth: 0.6,
  };

  return group;
}

/**
 * Low Obstacle 3: Fallen Protest Placards & Wooden Divider (Jumpable)
 */
export function createFallenPlacardObstacle(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Obstacle_FallenPlacard';

  // Stone divider base
  const stoneGeo = new THREE.BoxGeometry(2.2, 0.35, 0.4);
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9 });
  const stone = new THREE.Mesh(stoneGeo, stoneMat);
  stone.position.y = 0.175;
  stone.castShadow = true;
  group.add(stone);

  // Propped placards
  [-0.6, 0.4].forEach((x, idx) => {
    const cardGeo = new THREE.BoxGeometry(0.7, 0.9, 0.04);
    const cardMat = new THREE.MeshStandardMaterial({
      map: getPlacardTexture(idx),
      roughness: 0.7,
    });
    const card = new THREE.Mesh(cardGeo, cardMat);
    card.position.set(x, 0.45, 0.05);
    card.rotation.x = -0.4;
    card.rotation.y = idx === 0 ? 0.2 : -0.15;
    card.castShadow = true;
    group.add(card);
  });

  group.userData = {
    type: 'low',
    height: 0.9,
    width: 2.2,
    depth: 0.6,
  };

  return group;
}

/**
 * Overhead Obstacle: Delhi Security Scaffolding / Low Horizontal Barrier
 * Player MUST SLIDE beneath it!
 */
export function createOverheadBarrier(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Obstacle_OverheadBarrier';

  // Two tall side pillars
  [-1.15, 1.15].forEach((x) => {
    const pillarGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.2, 12);
    const pillar = new THREE.Mesh(pillarGeo, materials.yellowHazard);
    pillar.position.set(x, 1.6, 0);
    pillar.castShadow = true;
    group.add(pillar);

    // Concrete footings
    const footGeo = new THREE.BoxGeometry(0.35, 0.2, 0.35);
    const foot = new THREE.Mesh(footGeo, materials.sandstone);
    foot.position.set(x, 0.1, 0);
    group.add(foot);
  });

  // Top support girder
  const topGirderGeo = new THREE.BoxGeometry(2.6, 0.12, 0.12);
  const topGirder = new THREE.Mesh(topGirderGeo, materials.metalSteel);
  topGirder.position.set(0, 3.1, 0);
  group.add(topGirder);

  // Hanging Warning Banner Board (clears bottom at y = 1.05m -> requires sliding)
  const signGeo = new THREE.BoxGeometry(2.3, 0.8, 0.08);
  const signCanvas = document.createElement('canvas');
  signCanvas.width = 512;
  signCanvas.height = 160;
  const sCtx = signCanvas.getContext('2d')!;
  sCtx.fillStyle = '#dc2626';
  sCtx.fillRect(0, 0, 512, 160);
  sCtx.fillStyle = '#fef08a';
  for (let x = -80; x < 600; x += 60) {
    sCtx.fillRect(x, 0, 24, 160);
  }
  sCtx.fillStyle = '#0f172a';
  sCtx.fillRect(40, 30, 432, 100);
  sCtx.fillStyle = '#ffffff';
  sCtx.font = 'bold 32px sans-serif';
  sCtx.textAlign = 'center';
  sCtx.fillText('▼ CAUTION: LOW CLEARANCE ▼', 256, 75);
  sCtx.font = 'bold 22px sans-serif';
  sCtx.fillStyle = '#f59e0b';
  sCtx.fillText('SLIDE TO ESCAPE BARRICADE', 256, 110);

  const signTex = new THREE.CanvasTexture(signCanvas);
  signTex.colorSpace = THREE.SRGBColorSpace;
  const signMat = new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.5 });
  const signMesh = new THREE.Mesh(signGeo, signMat);
  signMesh.position.set(0, 1.8, 0); // Bottom is at 1.4, top at 2.2
  signMesh.castShadow = true;
  group.add(signMesh);

  // Low horizontal steel bar at y = 1.3m (protester stands 1.8m tall, so head hits it unless sliding!)
  const lowBarGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.4, 12);
  lowBarGeo.rotateZ(Math.PI / 2);
  const lowBar = new THREE.Mesh(lowBarGeo, materials.yellowHazard);
  lowBar.position.set(0, 1.35, 0);
  group.add(lowBar);

  group.userData = {
    type: 'overhead',
    minHeight: 0.85, // Clearance underneath for sliding
    maxHeight: 2.3,
    width: 2.3,
    depth: 0.5,
  };

  return group;
}

/**
 * Large Obstacle 1: Delhi Police Gypsy / Patrol Vehicle (Lane Dodgeable)
 */
export function createPoliceGypsy(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Obstacle_PoliceGypsy';

  // 1. Main body cabin
  const bodyGeo = new THREE.BoxGeometry(1.8, 1.1, 3.6);
  const body = new THREE.Mesh(bodyGeo, materials.carPaintWhite);
  body.position.y = 0.95;
  body.castShadow = true;
  group.add(body);

  // Police Door Decals on sides
  const doorGeo = new THREE.PlaneGeometry(1.8, 0.8);
  const doorMat = new THREE.MeshStandardMaterial({
    map: getPoliceDoorTexture(),
    roughness: 0.3,
  });

  const leftDoor = new THREE.Mesh(doorGeo, doorMat);
  leftDoor.position.set(-0.91, 0.95, 0);
  leftDoor.rotation.y = -Math.PI / 2;
  group.add(leftDoor);

  const rightDoor = new THREE.Mesh(doorGeo, doorMat);
  rightDoor.position.set(0.91, 0.95, 0);
  rightDoor.rotation.y = Math.PI / 2;
  group.add(rightDoor);

  // Cabin roof
  const roofGeo = new THREE.BoxGeometry(1.7, 0.75, 2.0);
  const roof = new THREE.Mesh(roofGeo, materials.carPaintWhite);
  roof.position.set(0, 1.6, -0.2);
  roof.castShadow = true;
  group.add(roof);

  // Windshield
  const windshieldGeo = new THREE.PlaneGeometry(1.6, 0.7);
  const windshield = new THREE.Mesh(windshieldGeo, materials.glass);
  windshield.position.set(0, 1.55, 0.82);
  windshield.rotation.x = -0.3;
  group.add(windshield);

  // Front Grille & Bullbar
  const bullbarGeo = new THREE.BoxGeometry(1.6, 0.6, 0.1);
  const bullbar = new THREE.Mesh(bullbarGeo, materials.metalSteel);
  bullbar.position.set(0, 0.8, 1.85);
  group.add(bullbar);

  // Red & Blue Emergency Beacon Lightbar
  const lightbarBase = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.25), materials.darkRubber);
  lightbarBase.position.set(0, 2.02, -0.2);
  group.add(lightbarBase);

  const blueLight = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.14, 0.2), materials.blueLightEmissive);
  blueLight.position.set(-0.3, 2.12, -0.2);
  group.add(blueLight);

  const redLight = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.14, 0.2), materials.redLightEmissive);
  redLight.position.set(0.3, 2.12, -0.2);
  group.add(redLight);

  // 4 Big Off-road Wheels
  const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.28, 16);
  wheelGeo.rotateZ(Math.PI / 2);

  const wheelPositions = [
    { x: -0.92, y: 0.38, z: 1.1 },
    { x: 0.92, y: 0.38, z: 1.1 },
    { x: -0.92, y: 0.38, z: -1.1 },
    { x: 0.92, y: 0.38, z: -1.1 },
  ];

  wheelPositions.forEach((pos) => {
    const wheel = new THREE.Mesh(wheelGeo, materials.darkRubber);
    wheel.position.set(pos.x, pos.y, pos.z);
    wheel.castShadow = true;

    // Rim
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.29, 12), materials.metalSteel);
    rim.rotation.z = Math.PI / 2;
    wheel.add(rim);

    group.add(wheel);
  });

  group.userData = {
    type: 'large',
    height: 2.2,
    width: 2.0,
    depth: 3.8,
  };

  return group;
}

/**
 * Large Obstacle 2: Iconic Delhi Auto-Rickshaw (Tuk-Tuk) (Lane Dodgeable)
 */
export function createAutorickshaw(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Obstacle_Autorickshaw';

  // Lower chassis & green body
  const bodyGeo = new THREE.BoxGeometry(1.5, 0.7, 2.4);
  const body = new THREE.Mesh(bodyGeo, materials.autoGreen);
  body.position.y = 0.65;
  body.castShadow = true;
  group.add(body);

  // Side CNG badges
  const cngDecalGeo = new THREE.PlaneGeometry(1.6, 0.6);
  const cngDecalMat = new THREE.MeshStandardMaterial({
    map: getAutorickshawTexture(),
    roughness: 0.4,
  });

  const leftCng = new THREE.Mesh(cngDecalGeo, cngDecalMat);
  leftCng.position.set(-0.76, 0.65, 0);
  leftCng.rotation.y = -Math.PI / 2;
  group.add(leftCng);

  const rightCng = new THREE.Mesh(cngDecalGeo, cngDecalMat);
  rightCng.position.set(0.76, 0.65, 0);
  rightCng.rotation.y = Math.PI / 2;
  group.add(rightCng);

  // Yellow curved roof canopy
  const roofGeo = new THREE.BoxGeometry(1.48, 0.75, 1.8);
  const roof = new THREE.Mesh(roofGeo, materials.autoYellow);
  roof.position.set(0, 1.35, -0.2);
  roof.castShadow = true;
  group.add(roof);

  // Slanted front windshield
  const windshieldGeo = new THREE.PlaneGeometry(1.3, 0.65);
  const windshield = new THREE.Mesh(windshieldGeo, materials.glass);
  windshield.position.set(0, 1.3, 0.72);
  windshield.rotation.x = -0.4;
  group.add(windshield);

  // Round front headlight
  const lightGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.1, 16);
  lightGeo.rotateX(Math.PI / 2);
  const light = new THREE.Mesh(
    lightGeo,
    new THREE.MeshStandardMaterial({ color: 0xffedd5, emissive: 0xfde047, emissiveIntensity: 1.2 })
  );
  light.position.set(0, 0.65, 1.25);
  group.add(light);

  // 3 Wheels (1 front, 2 rear)
  const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.22, 16);
  wheelGeo.rotateZ(Math.PI / 2);

  // Front wheel
  const frontWheel = new THREE.Mesh(wheelGeo, materials.darkRubber);
  frontWheel.position.set(0, 0.3, 0.95);
  frontWheel.castShadow = true;
  group.add(frontWheel);

  // Rear wheels
  const rearLeft = new THREE.Mesh(wheelGeo, materials.darkRubber);
  rearLeft.position.set(-0.75, 0.3, -0.75);
  rearLeft.castShadow = true;
  group.add(rearLeft);

  const rearRight = new THREE.Mesh(wheelGeo, materials.darkRubber);
  rearRight.position.set(0.75, 0.3, -0.75);
  rearRight.castShadow = true;
  group.add(rearRight);

  group.userData = {
    type: 'large',
    height: 1.8,
    width: 1.6,
    depth: 2.6,
  };

  return group;
}

/**
 * Large Obstacle 3: Delhi Roadside Chai & Samosa Vendor Cart
 */
export function createChaiCart(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Obstacle_ChaiCart';

  // Wooden table cart body
  const tableGeo = new THREE.BoxGeometry(1.6, 0.75, 1.8);
  const table = new THREE.Mesh(tableGeo, materials.wood);
  table.position.y = 0.65;
  table.castShadow = true;
  group.add(table);

  // Big brass tea samovar / kettle
  const kettleGeo = new THREE.CylinderGeometry(0.22, 0.26, 0.6, 16);
  const kettle = new THREE.Mesh(kettleGeo, materials.brass);
  kettle.position.set(-0.35, 1.25, 0.2);
  kettle.castShadow = true;
  group.add(kettle);

  // Samosa glass display cabinet
  const cabinetGeo = new THREE.BoxGeometry(0.65, 0.45, 0.7);
  const cabinet = new THREE.Mesh(cabinetGeo, materials.glass);
  cabinet.position.set(0.35, 1.2, -0.1);
  group.add(cabinet);

  // Colorful Indian market umbrella canopy
  const poleGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.8, 8);
  const pole = new THREE.Mesh(poleGeo, materials.metalSteel);
  pole.position.set(0, 1.65, -0.3);
  group.add(pole);

  const umbrellaGeo = new THREE.ConeGeometry(1.4, 0.5, 16);
  const umbrellaMat = new THREE.MeshStandardMaterial({
    color: 0xef4444, // Red canopy with orange segments
    roughness: 0.6,
  });
  const umbrella = new THREE.Mesh(umbrellaGeo, umbrellaMat);
  umbrella.position.set(0, 2.5, -0.3);
  umbrella.castShadow = true;
  group.add(umbrella);

  // 4 Cart spoke wheels
  const wheelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.08, 16);
  wheelGeo.rotateZ(Math.PI / 2);
  [-0.82, 0.82].forEach((x) => {
    [-0.6, 0.6].forEach((z) => {
      const w = new THREE.Mesh(wheelGeo, materials.wood);
      w.position.set(x, 0.32, z);
      group.add(w);
    });
  });

  group.userData = {
    type: 'large',
    height: 2.6,
    width: 1.8,
    depth: 2.0,
  };

  return group;
}

/**
 * 4. COLLECTIBLES & POWER-UPS
 */

/**
 * Indian Rupee Golden Coin
 */
export function createRupeeCoin(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'RupeeCoin';

  const coinGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.08, 24);
  coinGeo.rotateX(Math.PI / 2);

  const coin = new THREE.Mesh(coinGeo, materials.coinGold);
  coin.castShadow = true;
  group.add(coin);

  // Subtle pulsing halo ring
  const ringGeo = new THREE.RingGeometry(0.38, 0.44, 24);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xfde047,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.6,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  group.add(ring);

  group.userData = {
    type: 'coin',
    radius: 0.5,
  };

  return group;
}

export type PowerupType = 'chai_boost' | 'megaphone' | 'magnet' | 'sneakers';

export function createPowerup(type: PowerupType): THREE.Group {
  const group = new THREE.Group();
  group.name = `Powerup_${type}`;

  const haloGeo = new THREE.SphereGeometry(0.5, 16, 16);
  const haloMat = new THREE.MeshBasicMaterial({
    color: type === 'chai_boost' ? 0xf97316 : type === 'megaphone' ? 0xeab308 : type === 'magnet' ? 0xef4444 : 0x10b981,
    transparent: true,
    opacity: 0.35,
    wireframe: true,
  });
  const halo = new THREE.Mesh(haloGeo, haloMat);
  group.add(halo);

  if (type === 'chai_boost') {
    // Steaming traditional Kulhad clay tea cup
    const cupGeo = new THREE.CylinderGeometry(0.24, 0.16, 0.45, 16);
    const cup = new THREE.Mesh(cupGeo, materials.chaiClay);
    cup.castShadow = true;
    group.add(cup);

    // Golden tea surface
    const teaGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.02, 16);
    const teaMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.2 });
    const tea = new THREE.Mesh(teaGeo, teaMat);
    tea.position.y = 0.2;
    group.add(tea);
  } else if (type === 'megaphone') {
    // Protest Megaphone / Loudspeaker
    const coneGeo = new THREE.ConeGeometry(0.32, 0.6, 16);
    coneGeo.rotateZ(Math.PI / 2);
    const cone = new THREE.Mesh(coneGeo, materials.redHazard);
    group.add(cone);

    const handleGeo = new THREE.BoxGeometry(0.08, 0.25, 0.08);
    const handle = new THREE.Mesh(handleGeo, materials.darkRubber);
    handle.position.set(-0.15, -0.2, 0);
    group.add(handle);
  } else if (type === 'magnet') {
    // Horseshoe Coin Magnet
    const ringGeo = new THREE.TorusGeometry(0.28, 0.08, 12, 24, Math.PI * 1.3);
    ringGeo.rotateZ(Math.PI * 0.35);
    const magnet = new THREE.Mesh(ringGeo, materials.redHazard);
    group.add(magnet);
  } else {
    // Super Jump Winged Sneakers
    const sneakGeo = new THREE.BoxGeometry(0.25, 0.18, 0.5);
    const sneak = new THREE.Mesh(sneakGeo, materials.sneakers);
    group.add(sneak);

    const wingGeo = new THREE.BoxGeometry(0.04, 0.25, 0.2);
    const wingMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
    const leftWing = new THREE.Mesh(wingGeo, wingMat);
    leftWing.position.set(-0.16, 0.1, 0);
    group.add(leftWing);
    const rightWing = new THREE.Mesh(wingGeo, wingMat);
    rightWing.position.set(0.16, 0.1, 0);
    group.add(rightWing);
  }

  group.userData = {
    type: 'powerup',
    powerupType: type,
    radius: 0.7,
  };

  return group;
}

/**
 * 5. JANTAR MANTAR LANDMARKS & DELHI SCENERY
 */

/**
 * Samrat Yantra: The Giant 27m Triangular Sundial of Jantar Mantar
 */
export function createSamratYantra(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Landmark_SamratYantra';

  // Triangular gnomon wedge
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(16, 0);
  shape.lineTo(16, 14);
  shape.closePath();

  const extrudeSettings = {
    depth: 4.5,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.2,
    bevelThickness: 0.2,
  };

  const gnomonGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  gnomonGeo.center();
  const gnomon = new THREE.Mesh(gnomonGeo, materials.sandstone);
  gnomon.position.y = 7.0;
  gnomon.castShadow = true;
  gnomon.receiveShadow = true;
  group.add(gnomon);

  // Curved quadrant arcs flanking the ramp
  [-5, 5].forEach((zOffset) => {
    const arcGeo = new THREE.TorusGeometry(8.5, 0.8, 8, 24, Math.PI / 3);
    arcGeo.rotateX(Math.PI / 2);
    const arc = new THREE.Mesh(arcGeo, materials.sandstone);
    arc.position.set(0, 4.0, zOffset);
    arc.castShadow = true;
    group.add(arc);
  });

  return group;
}

/**
 * Ram Yantra: Cylindrical Astrological Observatory Tower
 */
export function createRamYantra(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Landmark_RamYantra';

  // Outer slotted cylindrical wall
  const wallGeo = new THREE.CylinderGeometry(5.0, 5.0, 6.0, 24, 1, true);
  const wall = new THREE.Mesh(wallGeo, materials.sandstone);
  wall.position.y = 3.0;
  wall.castShadow = true;
  group.add(wall);

  // Center measuring pillar
  const centerPillarGeo = new THREE.CylinderGeometry(0.8, 0.8, 7.5, 16);
  const centerPillar = new THREE.Mesh(centerPillarGeo, materials.sandstone);
  centerPillar.position.y = 3.75;
  centerPillar.castShadow = true;
  group.add(centerPillar);

  return group;
}

/**
 * Delhi Neem / Peepal Street Tree
 */
export function createDelhiStreetTree(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Scenery_Tree';

  // Trunk
  const trunkGeo = new THREE.CylinderGeometry(0.3, 0.45, 3.8, 8);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a2e18, roughness: 0.9 });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 1.9;
  trunk.castShadow = true;
  group.add(trunk);

  // Multi-layered lush foliage spheres
  const foliageMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });
  const foliageMat2 = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.85 });

  const f1 = new THREE.Mesh(new THREE.SphereGeometry(1.6, 12, 12), foliageMat);
  f1.position.set(0, 4.2, 0);
  f1.castShadow = true;
  group.add(f1);

  const f2 = new THREE.Mesh(new THREE.SphereGeometry(1.3, 10, 10), foliageMat2);
  f2.position.set(0.7, 4.6, 0.4);
  f2.castShadow = true;
  group.add(f2);

  const f3 = new THREE.Mesh(new THREE.SphereGeometry(1.2, 10, 10), foliageMat);
  f3.position.set(-0.6, 4.8, -0.3);
  f3.castShadow = true;
  group.add(f3);

  return group;
}

/**
 * Delhi Street Lamppost
 */
export function createStreetLamppost(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Scenery_Lamppost';

  // Tall pole
  const poleGeo = new THREE.CylinderGeometry(0.08, 0.12, 5.5, 12);
  const pole = new THREE.Mesh(poleGeo, materials.metalSteel);
  pole.position.y = 2.75;
  pole.castShadow = true;
  group.add(pole);

  // Curved top arm
  const armGeo = new THREE.BoxGeometry(1.2, 0.08, 0.08);
  const arm = new THREE.Mesh(armGeo, materials.metalSteel);
  arm.position.set(0.4, 5.4, 0);
  group.add(arm);

  // Lantern lamp head
  const lampGeo = new THREE.BoxGeometry(0.35, 0.2, 0.25);
  const lampMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xfef08a,
    emissiveIntensity: 1.5,
  });
  const lamp = new THREE.Mesh(lampGeo, lampMat);
  lamp.position.set(0.9, 5.3, 0);
  group.add(lamp);

  return group;
}

/**
 * Roadside Peaceful Protest Spectator with Placard
 */
export function createCrowdSpectator(placardIndex: number): THREE.Group {
  const group = new THREE.Group();

  // Stylized low-poly spectator
  const colors = [0x3b82f6, 0xef4444, 0x10b981, 0xf59e0b, 0x8b5cf6];
  const col = colors[placardIndex % colors.length];
  const specMat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.7 });

  const bodyGeo = new THREE.CylinderGeometry(0.2, 0.22, 1.4, 8);
  const body = new THREE.Mesh(bodyGeo, specMat);
  body.position.y = 0.7;
  group.add(body);

  const headGeo = new THREE.SphereGeometry(0.18, 12, 12);
  const head = new THREE.Mesh(headGeo, materials.skin);
  head.position.y = 1.55;
  group.add(head);

  // Waving protest placard held up high
  const poleGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.5, 8);
  const pole = new THREE.Mesh(poleGeo, materials.wood);
  pole.position.set(0.2, 1.6, 0);
  pole.rotation.z = -0.15;
  group.add(pole);

  const signGeo = new THREE.BoxGeometry(0.65, 0.8, 0.02);
  const signMat = new THREE.MeshStandardMaterial({ map: getPlacardTexture(placardIndex), roughness: 0.6 });
  const sign = new THREE.Mesh(signGeo, signMat);
  sign.position.set(0.25, 2.2, 0);
  sign.rotation.z = -0.15;
  group.add(sign);

  return group;
}
