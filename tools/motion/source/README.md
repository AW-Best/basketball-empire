# CMU source motion

Original free Acclaim skeleton and motion, subject124 / trial06 Basketball Lay Up.
Downloaded from the official CMU Graphics Lab Motion Capture Database on2026-10-17. Source URLs, hashes, conditions and acknowledgment are recorded in `../../../public/bubble-court/assets/CREDITS.md`.
Do not sell this data separately, including converted forms. Runtime uses a baked derivative embedded in Hoopire.

Rebuild: `node tools/motion/bake-dunk.js`. The parser converts ASF length units (inches divided by0.45) to metres; XYZ extrinsic degree rotations become C·R·C⁻¹. Source inputs remain unchanged. The retargeter uses full-body captured quaternion rotations, target bind offsets and ankle/rim IK; no target bone translation or scale animation.
