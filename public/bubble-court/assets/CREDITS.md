# Player model

Quaternius — Universal Base Characters / Superhero Male FullBody.
Original pack: https://quaternius.com/packs/universalbasecharacters.html
License: CC0 1.0 Universal (public-domain dedication).
GLB redistribution source: https://github.com/programasweights/avatar/blob/main/public/assets/character.glb
Source notes: https://github.com/programasweights/avatar/blob/main/ASSETS.md
Downloaded 2026-10-17; SHA-256: d6f3b64cab629f6ddca9ba063811aeffd3663a8a4e49ade47cd9505dc2bbd70f

Original geometry, skin weights, skeleton and bind transforms are retained. Hoopire changes materials into a teal street uniform and adds original hair, sneakers, number graphic and a locally baked basketball animation adapted from CMU motion capture (details below). No Mixamo animation is included.

The vendored GLTFLoader and BufferGeometryUtils are from the installed Three.js r180 distribution, MIT license in ../../vendor/THREE-LICENSE.txt.

# Basketball motion (v11)

CMU Graphics Lab Motion Capture Database — subject124, trial06, **Basketball Lay Up**.
Original source is a layup, not a dunk. Hoopire retains captured full-body approach, takeoff and landing, retargets it to the Quaternius rest skeleton, then edits jump height, rim-hand contact, ankle contacts and adds an authored return jog / ball pickup.

- Source listing: https://mocap.cs.cmu.edu/search.php?subjectnumber=124
- Skeleton: https://mocap.cs.cmu.edu/subjects/124/124.asf
- Motion: https://mocap.cs.cmu.edu/subjects/124/124_06.amc
- Official usage conditions: https://mocap.cs.cmu.edu/ (checked2026-10-17). The database allows free use including incorporation in commercially sold products; the data itself may not be sold separately, including converted versions. This game uses an embedded derivative animation and does not sell a motion-data pack.
- ASF SHA-256: b0e6a62b7e151200497b8bbcf42d0e95800decabec9254f8653e57dcde45dd45
- AMC SHA-256: 1613604580cec72e3f71a3d4e20308c1fe335512bf66ed3ef3fbeaa17f567e44
- Reproduce: `node tools/motion/bake-dunk.js` from repository root. Original inputs are in `tools/motion/source/`; processed clip is `dunk-motion.json`, which also records the combined source hash and edits.

The data used in this project was obtained from mocap.cs.cmu.edu. The database was created with funding from NSF EIA-0196217.
