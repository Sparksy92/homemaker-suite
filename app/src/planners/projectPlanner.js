// Pure project planner engine

export const PROJECT_TEMPLATES = [
    {
        id: 'raised_bed',
        title: 'Raised Bed Frame',
        system: 'Garden',
        difficulty: 'Easy',
        safetyLevel: 'Low',
        estimatedTime: '2 hours',
        materials: ['2x10 lumber (8ft)', 'Deck screws (3-inch)', 'Hardware cloth (wire mesh)', 'Cardboard (bottom barrier)'],
        tools: ['Circular saw or Hand saw', 'Drill / Driver', 'Tape measure', 'Staple gun'],
        steps: [
            { id: 1, text: 'Cut lumber into two 4ft sections and two 8ft sections.', completed: false },
            { id: 2, text: 'Lay out frame pieces on a flat surface in a rectangle.', completed: false },
            { id: 3, text: 'Pre-drill holes and drive screws to secure corners.', completed: false },
            { id: 4, text: 'Staple hardware cloth to the bottom of the frame to block gophers.', completed: false },
            { id: 5, text: 'Place frame on designated garden bed spot, lay down cardboard layers, and fill with 50/50 topsoil/compost mix.', completed: false }
        ],
        notes: 'Locate in full sun (6-8 hours daily). Ensure bed is level before filling.'
    },
    {
        id: 'compost_bin',
        title: 'Pallet Compost Bin',
        system: 'Garden',
        difficulty: 'Easy',
        safetyLevel: 'Low',
        estimatedTime: '3 hours',
        materials: ['4 clean shipping pallets (HT - Heat Treated only, no chemical MB pallets)', 'Heavy zip-ties or wire', 'Wood stakes'],
        tools: ['Hammer', 'Wire cutters', 'Work gloves'],
        steps: [
            { id: 1, text: 'Select a shady, well-drained spot near the garden.', completed: false },
            { id: 2, text: 'Stand three pallets on edge to form a three-sided square.', completed: false },
            { id: 3, text: 'Lash the pallets tightly together at the corners with heavy wire or zip-ties.', completed: false },
            { id: 4, text: 'Secure the pallets to wood stakes driven into the ground for stability.', completed: false },
            { id: 5, text: 'Use the fourth pallet as a swing gate or front barrier (removable for turning).', completed: false }
        ],
        notes: 'A standard 3-bin system is ideal: one for fresh deposits, one active/cooking, and one curing/ready.'
    },
    {
        id: 'cold_frame',
        title: 'Repurposed Glass Window Cold Frame',
        system: 'Garden',
        difficulty: 'Medium',
        safetyLevel: 'Medium',
        estimatedTime: '4 hours',
        materials: ['Old glass window frame', '2x12 lumber', 'Hinges and screws', 'Wood glue'],
        tools: ['Saw', 'Drill', 'Screwdriver', 'Sandpaper'],
        steps: [
            { id: 1, text: 'Measure the window frame dimensions.', completed: false },
            { id: 2, text: 'Build a box using 2x12 lumber matching the window footprint, sloping the sides by cutting a diagonal angle so the back wall is taller than the front.', completed: false },
            { id: 3, text: 'Screw box sides together and attach window frame to the back wall with hinges.', completed: false },
            { id: 4, text: 'Set cold frame in a south-facing spot to maximize winter sun.', completed: false },
            { id: 5, text: 'Place potted seedlings inside during late winter, venting the lid on sunny days.', completed: false }
        ],
        notes: 'Warning: Watch temperature! If sun hits a closed cold frame, temperatures can spike over 100°F (38°C) within minutes, killing seedlings.'
    },
    {
        id: 'woodshed',
        title: 'Simple Wood Curing Shed',
        system: 'Shelter',
        difficulty: 'Hard',
        safetyLevel: 'High',
        estimatedTime: '2 days',
        materials: ['4x4 posts', '2x4 framing studs', 'Corrugated metal roofing sheets', 'Concrete deck blocks', 'Nails / Roofing screws'],
        tools: ['Miter saw', 'Cordless drill', 'Level', 'Post hole digger / Shovel'],
        steps: [
            { id: 1, text: 'Mark a level 4x8 footprint on well-drained ground.', completed: false },
            { id: 2, text: 'Set concrete deck blocks at the corners and level them.', completed: false },
            { id: 3, text: 'Erect 4x4 posts, ensuring back posts are shorter to create a sloped roof slope.', completed: false },
            { id: 4, text: 'Frame the rafters and horizontal slats for walls to allow maximum airflow.', completed: false },
            { id: 5, text: 'Screw metal roof sheets onto the rafters and store split firewood off the wet ground.', completed: false }
        ],
        notes: 'Ensure walls are open slats. Wood needs wind/airflow to cure properly. Curing takes 6-12 months.'
    },
    {
        id: 'root_cellar',
        title: 'Root Cellar Double-Pipe Ventilation',
        system: 'Preservation',
        difficulty: 'Medium',
        safetyLevel: 'Medium',
        estimatedTime: '6 hours',
        materials: ['4-inch PVC piping (10ft)', 'Elbow joints', 'Insect screening wire mesh', 'Pipe clamps'],
        tools: ['Hacksaw', 'Drill / Hole saw', 'Measuring tape'],
        steps: [
            { id: 1, text: 'Plan vent layout: one low intake pipe bringing cool air in, one high exhaust pipe letting warm air out.', completed: false },
            { id: 2, text: 'Cut PVC pipe sections to fit cellar wall penetrations.', completed: false },
            { id: 3, text: 'Install intake pipe running down near the floor (within 1ft).', completed: false },
            { id: 4, text: 'Install exhaust pipe high in the ceiling at the opposite corner of the room.', completed: false },
            { id: 5, text: 'Clamp fine metal wire mesh over both external pipe openings to block rodents/insects.', completed: false }
        ],
        notes: 'Use dampers on both pipes to regulate airflow in deep winter. Close vents if outside air is below freezing.'
    },
    {
        id: 'rain_catchment',
        title: 'Gravity-Fed Rain Barrel Stand',
        system: 'Water',
        difficulty: 'Medium',
        safetyLevel: 'Medium',
        estimatedTime: '3 hours',
        materials: ['4x4 lumber', '2x6 framing lumber', 'Deck screws', 'Cinder blocks (foundation)'],
        tools: ['Saw', 'Level', 'Drill', 'Tape measure'],
        steps: [
            { id: 1, text: 'Clear and level ground beneath a downspout gutter.', completed: false },
            { id: 2, text: 'Lay cinder blocks flat as a firm, non-settling footprint.', completed: false },
            { id: 3, text: 'Build a heavy-duty platform using 4x4 legs and 2x6 framing. Remember: 55 Gallons of water weighs 460 lbs.', completed: false },
            { id: 4, text: 'Check platform level in both directions.', completed: false },
            { id: 5, text: 'Place cleaned drum/barrel on top, secure spigot fittings, and connect to gutter downspout diverter.', completed: false }
        ],
        notes: 'Warning: Water is extremely heavy. A weak stand collapses and can crush objects or children. Overbuild for safety.'
    },
    {
        id: 'pantry_shelves',
        title: 'Heavy-Duty Pantry Canning Shelves',
        system: 'Preservation',
        difficulty: 'Medium',
        safetyLevel: 'Low',
        estimatedTime: '5 hours',
        materials: ['2x4 studs', '3/4-inch plywood', 'Wood screws', 'Metal L-brackets'],
        tools: ['Saw', 'Level', 'Drill', 'Stud finder'],
        steps: [
            { id: 1, text: 'Measure wall space, checking heights and depths (12-inch shelves are best for jars).', completed: false },
            { id: 2, text: 'Use a stud finder to locate wall framing. Canning jars are very heavy; shelves MUST anchor into studs.', completed: false },
            { id: 3, text: 'Build upright ladder frames using 2x4 lumber.', completed: false },
            { id: 4, text: 'Screw shelf supports into ladder uprights and place plywood shelves.', completed: false },
            { id: 5, text: 'Anchor the entire shelving unit to wall studs using L-brackets to prevent tipping.', completed: false }
        ],
        notes: 'Standard glass jars should not be stacked directly on top of each other. Build shelf spacing every 8-10 inches.'
    },
    {
        id: 'handwashing',
        title: 'Emergency Foot-Pump Handwashing Station',
        system: 'Sanitation',
        difficulty: 'Easy',
        safetyLevel: 'Low',
        estimatedTime: '2 hours',
        materials: ['Marine foot bulb pump', 'Two 5-gallon food-grade buckets', 'Flexible tubing', 'Sink basin (or small tub)'],
        tools: ['Utility knife', 'Drill / Hole saw', 'Clamps'],
        steps: [
            { id: 1, text: 'Clean both buckets. Mark one for "Clean Water" and one for "Greywater".', completed: false },
            { id: 2, text: 'Drill a hole in the clean bucket lid for tubing.', completed: false },
            { id: 3, text: 'Run tubing from the clean bucket bottom to the inlet of the marine foot pump.', completed: false },
            { id: 4, text: 'Run outlet tubing from the foot pump up to a faucet nozzle secured above the sink basin.', completed: false },
            { id: 5, text: 'Position the greywater bucket directly beneath the sink basin drain hole.', completed: false }
        ],
        notes: 'Maintains hygiene during water interruptions. Dispose of greywater safely away from food garden beds.'
    }
];

export const createProjectFromTemplate = (templateOrId) => {
    let template = null;
    if (typeof templateOrId === 'string') {
        template = PROJECT_TEMPLATES.find(t => t.id === templateOrId);
    } else {
        template = templateOrId;
    }
    if (!template || !template.id) return null;

    return {
        id: `project-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        sourceBlueprintId: template.id,
        title: template.title,
        system: template.system,
        status: 'planned', // planned, active, paused, complete
        priority: 'medium',
        difficulty: template.difficulty,
        safetyLevel: template.safetyLevel,
        estimatedTime: template.estimatedTime,
        materials: template.materials ? [...template.materials] : [],
        tools: template.tools ? [...template.tools] : [],
        steps: template.steps ? template.steps.map(s => ({ ...s, completed: false })) : [],
        notes: template.notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
};

export const getNextProjectStep = (project) => {
    if (!project || !project.steps) return null;
    return project.steps.find(s => !s.completed) || null;
};

export const calculateProjectProgress = (project) => {
    if (!project || !project.steps || project.steps.length === 0) return 0;
    const completed = project.steps.filter(s => s.completed).length;
    return Math.round((completed / project.steps.length) * 100);
};

export const generateProjectTasks = (project) => {
    if (!project || !project.steps) return [];
    return project.steps.map(s => ({
        id: `task-${project.id}-${s.id}`,
        title: `Project Step: ${project.title}`,
        desc: s.text,
        completed: s.completed,
        type: 'project'
    }));
};
