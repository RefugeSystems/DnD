var letter;

// letter = `The flock here continues to serve her elegance and they have planned an excursion from here to hadria for the vote.`;
letter = `The delivery will come on Ska 22, expect 22 child bodies infected with the blight. Expecting to retrieve the result on Unq 5.`;

var output,
	cipher,
	hymns,
	lines,
	line,
	out,
	c,
	i,
	j;

loadData();

/*
 * Breaks up a long encrypted letter into lines of 40 characters each
 */

output = cipher.encrypt(letter, "Cleric Kotanon of Thalen");
lines = [];
line = [];

// console.log("# Encrypted:\n" + output);

output = output.replace(/\r?\n/g,"\n");
for(i=0; i<output.length; i++) {
	c = output.charAt(i);
	if(c === "\n") {
		lines.push(line.join(""));
		line = [];
	} else {
		line.push(c);
		if(line.length >= 40) {
			lines.push(line.join(""));
			line = [];
		}
	}
}
if(line.length > 0) {
	lines.push(line.join(""));
}
console.log("# Lined:\n" + (out = lines.join("\n").replace(/\n\n\n/g,"\n\n")));
console.log("# Decrypted Lines:\n" + cipher.decrypt(out));
console.log("# Decrypted:\n" + cipher.decrypt(output));



function loadData() {
	hymns = {};
    var load = [
    {
        "id": "item:radiantism:hymn:1",
        "name": "Hymn of Sacred Form",
        "description": "A hymn from Radiantism\n\n(See: {{#knowledge:radiantism:hymns}})",
        "masthead": "In her name...",
        "print_columns": [
            "Radiance first shaped the world in glory,\nand in Her reflection all beings found their purpose.\nKnow this: beauty is the highest hymn,\nthe breath through which all creation sings.\n\nThe body is Her vessel,\ngiven that we may sculpt it toward Her likeness.\nAs the sculptor carves away the stone to free the divine within,\nso must the faithful refine themselves in spirit and in flesh.\n\nThrough striving, the dull becomes gleaming;\nthrough devotion, the dim becomes shining.\nLet no follower fear the chisel that perfects—\nfor every cut, every ache, is a step toward Her eternal grace."
        ],
        "footer": "...Beauty prevails",
        "icon": "game-icon game-icon-abstract-097",
        "associations": [
            "knowledge:religion:radiantism"
        ],
        "categories": [
            "category:peoples:cultures"
        ]
    },
    {
        "id": "item:radiantism:hymn:2",
        "name": "Canticle of the Unbroken Flame",
        "description": "A hymn from Radiantism\n\n(See: {{#knowledge:radiantism:hymns}})",
        "masthead": "In her name...",
        "print_columns": [
            "Radiance burns unending, a holy fire without shadow.\nThose who walk in Her light must embrace the heat,\nfor suffering is but the furnace wherein imperfection melts away.\n\nSeek not comfort over refinement,\nfor gold is never pure until it knows the flame.\nThus do the faithful endure,\nthat they may shine with Her brilliance.\n\nGuard the Radiance, for it is the breath of the divine\nand the foundation of all that is exalted.\nLet no corruption dim the flame,\nnor any false teaching cool the sacred glow.\nFor in preserving Her light,\nwe preserve the very essence of Perfection."
        ],
        "footer": "...Beauty prevails",
        "icon": "game-icon game-icon-abstract-097",
        "associations": [
            "knowledge:religion:radiantism"
        ],
        "categories": [
            "category:peoples:cultures"
        ]
    },
    {
        "id": "item:radiantism:hymn:3",
        "name": "The Hymn of Gentle Light",
        "description": "A hymn from Radiantism\n\n(See: {{#knowledge:radiantism:hymns}})",
        "masthead": "In her name...",
        "print_columns": [
            "Radiance keep me through the night,\nWrap me softly in Her light.\nLet every shadow fade away,\nAnd shape me pure at break of day.\n\nGuide my heart to stillness deep,\nWhere blessed ones may safely sleep.\nIf dawn should call me to Her side,\nI’ll walk in peace, with joy as guide.\n\nFor in Her warmth no fear can stay,\nAnd those She chooses need not stray.\nSo let me rest in quiet grace—\nPrepared to meet Her shining face."
        ],
        "footer": "...Beauty prevails",
        "icon": "game-icon game-icon-abstract-097",
        "associations": [
            "knowledge:religion:radiantism"
        ],
        "categories": [
            "category:peoples:cultures"
        ]
    },
    {
        "id": "item:radiantism:hymn:4",
        "name": "Hymn of the Shining Vigil",
        "description": "A hymn from Radiantism\n\n(See: {{#knowledge:radiantism:hymns}})",
        "masthead": "In her name...",
        "print_columns": [
            "Radiance rises where faith endures,\nIn quiet hearts the light secures.\nFrom whispered vow to open gaze,\nWe walk the path Her glow portrays."
        ],
        "footer": "...Beauty prevails",
        "icon": "game-icon game-icon-abstract-097",
        "associations": [
            "knowledge:religion:radiantism"
        ],
        "categories": [
            "category:peoples:cultures"
        ]
    },
    {
        "id": "item:radiantism:hymn:5",
        "name": "Canticle of the Gentle Flame",
        "description": "A hymn from Radiantism\n\n(See: {{#knowledge:radiantism:hymns}})",
        "masthead": "In her name...",
        "print_columns": [
            "Let mercy warm the trembling soul,\nAs holy fire makes fragments whole.\nThrough trial and trust our forms align,\nRefined by grace, by will divine."
        ],
        "footer": "...Beauty prevails",
        "icon": "game-icon game-icon-abstract-097",
        "associations": [
            "knowledge:religion:radiantism"
        ],
        "categories": [
            "category:peoples:cultures"
        ]
    },
    {
        "id": "item:radiantism:hymn:6",
        "name": "The Measure of Sacred Form",
        "description": "A hymn from Radiantism\n\n(See: {{#knowledge:radiantism:hymns}})",
        "masthead": "In her name...",
        "print_columns": [
            "Each breath a gift, each step a test,\nThe faithful shaped, the chosen blessed.\nIn shadowed hours and brilliant days,\nWe turn our eyes to perfect ways."
        ],
        "footer": "...Beauty prevails",
        "icon": "game-icon game-icon-abstract-097",
        "associations": [
            "knowledge:religion:radiantism"
        ],
        "categories": [
            "category:peoples:cultures"
        ]
    },
    {
        "id": "item:radiantism:hymn:7",
        "name": "Hymn of Dawnbound Grace",
        "description": "A hymn from Radiantism\n\n(See: {{#knowledge:radiantism:hymns}})",
        "masthead": "In her name...",
        "print_columns": [
            "When morning breaks on silent skin,\nHer light awakens truth within.\nNo fear may cling, no doubt may stay,\nFor Radiance leads us, come what may."
        ],
        "footer": "...Beauty prevails",
        "icon": "game-icon game-icon-abstract-097",
        "associations": [
            "knowledge:religion:radiantism"
        ],
        "categories": [
            "category:peoples:cultures"
        ]
    },
    {
        "id": "item:radiantism:hymn:001",
        "name": "Hymn of the Crossing Bridge",
        "description": "A hymn from Radiantism\n\n(See: {{#knowledge:radiantism:hymns}})",
        "masthead": "In her name...",
        "print_columns": [
            "Between the known and what must be,\nThe bridge demands humility.\nStep steady, though the span feels thin,\nFor Radiance waits where doubt begins."
        ],
        "footer": "...Beauty prevails",
        "icon": "game-icon game-icon-abstract-097",
        "associations": [
            "knowledge:religion:radiantism"
        ],
        "categories": [
            "category:peoples:cultures"
        ]
    },
    {
        "id": "item:radiantism:hymn:8",
        "name": "Litany of Enduring Light",
        "description": "A hymn from Radiantism\n\n(See: {{#knowledge:radiantism:hymns}})",
        "masthead": "In her name...",
        "print_columns": [
            "By word and deed our faith is shown,\nIn acts of care, in strength alone.\nLet form and spirit both agree,\nMade whole in sacred harmony."
        ],
        "footer": "...Beauty prevails",
        "icon": "game-icon game-icon-abstract-097",
        "associations": [
            "knowledge:religion:radiantism"
        ],
        "categories": [
            "category:peoples:cultures"
        ]
    },
    {
        "id": "item:radiantism:hymn:9",
        "name": "Chant of Clear Mirrors",
        "description": "A hymn from Radiantism\n\n(See: {{#knowledge:radiantism:hymns}})",
        "masthead": "In her name...",
        "print_columns": [
            "Radiance, polish what is blurred,\nMake steady what has been disturbed.\nLet thought be clean, let gesture true,\nSo all we are reflects of You."
        ],
        "footer": "...Beauty prevails",
        "icon": "game-icon game-icon-abstract-097",
        "associations": [
            "knowledge:religion:radiantism"
        ],
        "categories": [
            "category:peoples:cultures"
        ]
    },
    {
        "id": "item:radiantism:hymn:10",
        "name": "Song of the Lantern Choir",
        "description": "A hymn from Radiantism\n\n(See: {{#knowledge:radiantism:hymns}})",
        "masthead": "In her name...",
        "print_columns": [
            "We lift the lamp, we lift the voice,\nIn Radiance we make our choice.\nLet darkness pass, let doubts depart,\nSet gentle flame within the heart."
        ],
        "footer": "...Beauty prevails",
        "icon": "game-icon game-icon-abstract-097",
        "associations": [
            "knowledge:religion:radiantism"
        ],
        "categories": [
            "category:peoples:cultures"
        ]
    },
    {
        "id": "item:radiantism:hymn:11",
        "name": "The Bright Oath (Public Chorus)",
        "description": "A hymn from Radiantism\n\n(See: {{#knowledge:radiantism:hymns}})",
        "masthead": "In her name...",
        "print_columns": [
            "I walk in light, I speak in grace,\nI keep my gaze on perfect face.\nI bear the day, I brave the night,\nBound to the path of Radiant light."
        ],
        "footer": "...Beauty prevails",
        "icon": "game-icon game-icon-abstract-097",
        "associations": [
            "knowledge:religion:radiantism"
        ],
        "categories": [
            "category:peoples:cultures"
        ]
    },
    {
        "id": "item:radiantism:hymn:12",
        "name": "Hymn of the Quiet Step",
        "description": "A hymn from Radiantism\n\n(See: {{#knowledge:radiantism:hymns}})",
        "masthead": "In her name...",
        "print_columns": [
            "Softly we move, yet firmly stand,\nBy Radiance guided, hand in hand.\nIn measured breath and patient pace,\nWe learn the art of sacred grace."
        ],
        "footer": "...Beauty prevails",
        "icon": "game-icon game-icon-abstract-097",
        "associations": [
            "knowledge:religion:radiantism"
        ],
        "categories": [
            "category:peoples:cultures"
        ]
    },
    {
        "id": "item:radiantism:hymn:13",
        "name": "The Psalm of the Unshadowed Gate",
        "description": "A hymn from Radiantism\n\n(See: {{#knowledge:radiantism:hymns}})",
        "masthead": "In her name...",
        "print_columns": [
            "Open the gate where gloom once lay,\nLet Radiance usher in the day.\nNo hidden fear, no secret stain,\nMay linger in Her golden reign."
        ],
        "footer": "...Beauty prevails",
        "icon": "game-icon game-icon-abstract-097",
        "associations": [
            "knowledge:religion:radiantism"
        ],
        "categories": [
            "category:peoples:cultures"
        ]
    },
    {
        "id": "item:radiantism:hymn:14",
        "name": "Canticle of the Refined Voice",
        "description": "A hymn from Radiantism\n\n(See: {{#knowledge:radiantism:hymns}})",
        "masthead": "In her name...",
        "print_columns": [
            "Let speech be pure, let anger cease,\nLet every word be shaped to peace.\nFor Radiance hears what hearts intend,\nAnd forms our sound to brighter end."
        ],
        "footer": "...Beauty prevails",
        "icon": "game-icon game-icon-abstract-097",
        "associations": [
            "knowledge:religion:radiantism"
        ],
        "categories": [
            "category:peoples:cultures"
        ]
    },
    {
        "id": "item:radiantism:hymn:15",
        "name": "Hymn of the Steady Flame",
        "description": "A hymn from Radiantism\n\n(See: {{#knowledge:radiantism:hymns}})",
        "masthead": "In her name...",
        "print_columns": [
            "A candle small can face the gale,\nIf Radiance makes the spirit hale.\nSo keep the wick, so tend the glow,\nAnd let the holy brightness grow."
        ],
        "footer": "...Beauty prevails",
        "icon": "game-icon game-icon-abstract-097",
        "associations": [
            "knowledge:religion:radiantism"
        ],
        "categories": [
            "category:peoples:cultures"
        ]
    },
    {
        "id": "item:radiantism:hymn:16",
        "name": "Prayer of Unending Radiance",
        "description": "A hymn from Radiantism\n\n(See: {{#knowledge:radiantism:hymns}})",
        "masthead": "In her name...",
        "print_columns": [
            "Radiance who dawns before all knowing,\nHear us as we gather in Your glow.\n\nLet the morning find us worthy,\nAnd the evening leave us refined.\n\nWe lift our voices not in fear,\nBut in trust that You see clearly.\n\nShape our days as You shape the world,\nWith gentle purpose and unbroken will.\n\nWhere doubt lingers, let light settle.\nWhere weakness trembles, let strength arise.\n\nTeach us to walk the narrow path,\nNeither fleeing shadow nor worshiping it.\n\nMay our forms reflect devotion,\nAnd our actions reveal belief.\n\nLet each breath be an offering,\nEach silence a moment of listening.\n\nGuide the faithful through quiet trials,\nAnd steady the hearts that waver.\n\nIn hardship, remind us of becoming.\nIn comfort, remind us of duty.\n\nLet no moment be wasted,\nNor any gift left unshaped.\n\nFor You are the measure of all things,\nAnd we are measured in You.\n\nBind us together in shared purpose,\nYet set apart those who shine brightest.\n\nMay we accept correction with grace,\nAnd receive instruction without resistance.\n\nKeep our hands clean in service,\nAnd our spirits calm in change.\n\nIf we are called to stand, let us stand proudly.\nIf we are called to yield, let us do so willingly.\n\nFor Radiance does not abandon the devoted,\nNor overlook what is freely given.\n\nIn Your light we rest.\nIn Your will we endure.\n\nLet dawn remake us once more."
        ],
        "footer": "...Beauty prevails",
        "icon": "game-icon game-icon-abstract-097",
        "associations": [
            "knowledge:religion:radiantism"
        ],
        "categories": [
            "category:peoples:cultures"
        ]
    },
    {
        "id": "item:radiantism:hymn:17",
        "name": "Prayer of the Morning Mirror",
        "description": "A hymn from Radiantism\n\n(See: {{#knowledge:radiantism:hymns}})",
        "masthead": "In her name...",
        "print_columns": [
            "Radiance, set my face to truth,\nLet dawn reveal what must be soothed.\nBurn away the lesser part,\nAnd steady me with gentle art.\n\nLet my hands do worthy things,\nLet my voice be soft as springs.\nIf I err, correct in light,\nAnd turn my wandering back to right.\n\nMake my will a tempered blade,\nNot quick to boast, not quick to fade.\nSo I may walk the day made new,\nA clearer form, devoted, true."
        ],
        "footer": "...Beauty prevails",
        "icon": "game-icon game-icon-abstract-097",
        "associations": [
            "knowledge:religion:radiantism"
        ],
        "categories": [
            "category:peoples:cultures"
        ]
    },
    {
        "id": "item:radiantism:hymn:18",
        "name": "Prayer for the Tested and Tired",
        "description": "A hymn from Radiantism\n\n(See: {{#knowledge:radiantism:hymns}})",
        "masthead": "In her name...",
        "print_columns": [
            "Radiance, when my steps grow slow,\nAnd every breath is heavy woe,\nRemind my heart that trials refine,\nAnd pain may shape a truer line.\n\nGive me calm where voices bite,\nGive me sight in fading light.\nLet me endure what must be borne,\nAnd rise again, remade by morn."
        ],
        "footer": "...Beauty prevails",
        "icon": "game-icon game-icon-abstract-097",
        "associations": [
            "knowledge:religion:radiantism"
        ],
        "categories": [
            "category:peoples:cultures"
        ]
    },
    {
        "id": "item:radiantism:hymn:19",
        "name": "Litany of the Sacred Threshold",
        "description": "A hymn from Radiantism\n\n(See: {{#knowledge:radiantism:hymns}})",
        "masthead": "In her name...",
        "print_columns": [
            "At the threshold of the temple, Radiance, meet us.\nAt the threshold of the home, Radiance, keep us.\nAt the threshold of the day, Radiance, guide us.\nAt the threshold of the night, Radiance, seal us.\n\nLet none who enter carry spite,\nLet none who leave forget the light.\nMake every doorway bright and clean,\nAnd every path a clearer sheen."
        ],
        "footer": "...Beauty prevails",
        "icon": "game-icon game-icon-abstract-097",
        "associations": [
            "knowledge:religion:radiantism"
        ],
        "categories": [
            "category:peoples:cultures"
        ]
    },
    {
        "id": "item:radiantism:hymn:20",
        "name": "Prayer of the Quiet Choir",
        "description": "A hymn from Radiantism\n\n(See: {{#knowledge:radiantism:hymns}})",
        "masthead": "In her name...",
        "print_columns": [
            "Radiance, hear the words unspoken,\nThe hidden grief, the vow unbroken.\nTeach my mind to hold its peace,\nUntil the trembling thoughts release.\n\nLet my spirit learn to wait,\nNot rushing joy, not cursing fate.\nFor even silence can be praise,\nWhen held within Your steady blaze."
        ],
        "footer": "...Beauty prevails",
        "icon": "game-icon game-icon-abstract-097",
        "associations": [
            "knowledge:religion:radiantism"
        ],
        "categories": [
            "category:peoples:cultures"
        ]
    },
    {
        "id": "item:radiantism:hymn:21",
        "name": "Hymn of the Golden Measure",
        "description": "A hymn from Radiantism\n\n(See: {{#knowledge:radiantism:hymns}})",
        "masthead": "In her name...",
        "print_columns": [
            "Measure my pride, and make it small,\nSo Radiance may fill it all.\nMeasure my fear, and make it cease,\nSo I may walk in shaped-out peace.\n\nMeasure my words, and make them bright,\nSo truth may live in gentle light."
        ],
        "footer": "...Beauty prevails",
        "icon": "game-icon game-icon-abstract-097",
        "associations": [
            "knowledge:religion:radiantism"
        ],
        "categories": [
            "category:peoples:cultures"
        ]
    },
    {
        "id": "item:radiantism:hymn:22",
        "name": "The Evening Benediction of Leigh",
        "description": "A hymn from Radiantism\n\n(See: {{#knowledge:radiantism:hymns}})",
        "masthead": "In her name...",
        "print_columns": [
            "Radiance, fold the day to rest,\nAnd set Your calm within my chest.\nLet every harshness fade away,\nAnd leave me clean for dawning day.\n\nIf dreams should come, let them be clear;\nIf shadows stir, keep terror near.\nFor in Your glow, the night is kind,\nAnd even darkness is refined."
        ],
        "footer": "...Beauty prevails",
        "icon": "game-icon game-icon-abstract-097",
        "associations": [
            "knowledge:religion:radiantism"
        ],
        "categories": [
            "category:peoples:cultures"
        ]
	}, {
		"id": "hymn",
		"name": "Hymn of the First Step",
		"description": "",
		"print_columns": [
			"No path is clear before we go,\nThe light arrives with motion slow.\nTake one true step, then one once more,\nAnd Radiance reveals the door."
		]
    }];

	load.forEach(function(hymn) {
		hymns[hymn.name] = hymn.print_columns[0];
	});

	// cipher = new ScriptureCipher("Divinance Hymn 2", hymns["Canticle of the Unbroken Flame"]);
	cipher = new ScriptureCipher("Quiet Choir", hymns["Prayer of the Quiet Choir"]);
}