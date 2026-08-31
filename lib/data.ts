// Video Registry - Centralized storage for ALL videos to ensure uniqueness
// Each video has a unique ID and URL that cannot be duplicated
export interface Video {
  id: number;
  url: string;
  caption: string;
  username: string;
  name: string;
  verified: boolean;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  timestamp: string;
  hashtags: string[];
  soundName: string;
  soundId: string;
  following: boolean;
}

// Central video registry - ALL videos must be defined here
// This ensures no duplicate videos across the app
const videoRegistry: Record<number, Video> = {
  // For You Feed Videos (IDs 1-100)
  1: {
    id: 1,
    url: "https://github.com/colegottdank/colegottdank/releases/download/v1.0/subway-surfers.mp4",
    caption: "SUBWAY SURFERS GAMEPLAY AT 3AM WHILE LISTENING TO THE LORE 🏃‍♂️🚇 NAHHHH THE DOPAMINE IS IMMACULATE. I LITERALLY CANNOT STOP WATCHING. MY BRAIN IS COOKED FR FR",
    username: "subway_surfer_pro",
    name: "SUBWAY SURFER PRO",
    verified: true,
    likes: 7777777,
    comments: 420420,
    shares: 666666,
    views: 99999999,
    timestamp: "2h",
    hashtags: ["#fyp", "#subwaysurfers", "#brainrot", "#sigma", "#grindset"],
    soundName: "subway surfers theme phonk remix",
    soundId: "sound-1",
    following: false
  },
  2: {
    id: 2,
    url: "https://github.com/colegottdank/colegottdank/releases/download/v1.0/satisfying-soap.mp4",
    caption: "SOAP CUTTING ASMR AT 3AM AND NOW MY BRAIN IS PERMANENTLY BROKEN 🧼✂️ THE CRUNCHY SOUNDS ARE SO SATISFYING I CANT STOP WATCHING. THE DOPAMINE IS IMMACULATE",
    username: "soap_cutting_asmr",
    name: "SOAP CUTTING ASMR",
    verified: false,
    likes: 5555555,
    comments: 333333,
    shares: 444444,
    views: 77777777,
    timestamp: "5h",
    hashtags: ["#fyp", "#skibidi", "#brainrot", "#skibiditoilet", "#lore"],
    soundName: "skibidi dop dop yes yes phonk",
    soundId: "sound-2",
    following: true
  },
  3: {
    id: 3,
    url: "https://github.com/colegottdank/colegottdank/releases/download/v1.0/minecraft-parkour.mp4",
    caption: "MINECRAFT PARKOUR WITH SHADERS IS THE MOST BEAUTIFUL THING IVE EVER SEEN 🎮✨ THE BLOCKS ARE SO SATISFYING. I CANT STOP JUMPING. MY BRAIN IS PERMANENTLY IN PARKOUR MODE",
    username: "mc_parkour_god",
    name: "MC PARKOUR GOD",
    verified: false,
    likes: 2890000,
    comments: 69420,
    shares: 222222,
    views: 38000000,
    timestamp: "8h",
    hashtags: ["#fyp", "#familyguy", "#brainrot", "#petergriffin", "#funny"],
    soundName: "family guy funny moments compilation",
    soundId: "sound-3",
    following: false
  },
  4: {
    id: 4,
    url: "https://github.com/colegottdank/colegottdank/releases/download/v1.0/gta-stunts.mp4",
    caption: "GTA V IMPOSSIBLE STUNT RACE AND BRO ACTUALLY MADE IT 🏎️💨 NAHHHH THE PHYSICS IN THIS GAME ARE UNHINGED. HOW DID HE NOT EXPLODE. IM SCREAMING",
    username: "gta_stunts_daily",
    name: "GTA STUNTS DAILY",
    verified: true,
    likes: 8888888,
    comments: 555555,
    shares: 777777,
    views: 88888888,
    timestamp: "12h",
    hashtags: ["#fyp", "#spongebob", "#brainrot", "#nickelodeon", "#outofcontext"],
    soundName: "spongebob trap remix bass boosted",
    soundId: "sound-4",
    following: true
  },
  5: {
    id: 5,
    url: "https://github.com/colegottdank/colegottdank/releases/download/v1.0/kinetic-sand.mp4",
    caption: "KINETIC SAND CUTTING ASMR IS THE ONLY THING KEEPING ME SANE 🏖️✂️ THE COLORS ARE SO SATISFYING. THE SOUNDS ARE IMMACULATE. I HAVE WATCHED THIS 847 TIMES",
    username: "sand_cutting_asmr",
    name: "SAND CUTTING ASMR",
    verified: false,
    likes: 6666666,
    comments: 444444,
    shares: 555555,
    views: 66666666,
    timestamp: "1d",
    hashtags: ["#fyp", "#ohno", "#brainrot", "#viral", "#trending"],
    soundName: "oh no oh no oh no no no (sped up)",
    soundId: "sound-5",
    following: false
  },
  6: {
    id: 6,
    url: "https://github.com/colegottdank/colegottdank/releases/download/v1.0/temple-run.mp4",
    caption: "TEMPLE RUN GAMEPLAY HITS DIFFERENT AT 3AM 🏃‍♂️🏛️ THE NOSTALGIA IS UNHINGED. I USED TO PLAY THIS ON MY IPOD TOUCH. THE MONKEYS ARE STILL CHASING ME IN MY DREAMS",
    username: "temple_run_og",
    name: "TEMPLE RUN OG",
    verified: true,
    likes: 9999999,
    comments: 666666,
    shares: 888888,
    views: 111111111,
    timestamp: "2d",
    hashtags: ["#fyp", "#redcircle", "#brainrot", "#didyouseeit", "#attention"],
    soundName: "dramatic suspense phonk bass boosted",
    soundId: "sound-6",
    following: true
  },
  
  // Following Feed Videos (IDs 101-200)
  101: {
    id: 101,
    url: "https://github.com/colegottdank/colegottdank/releases/download/v1.0/subway-surfers.mp4",
    caption: "POV: you put subway surfers on the bottom half while watching a reddit story and now you cant stop 🏃‍♂️📖 THE PRODUCTIVITY IS NEGATIVE. IM COOKED",
    username: "subway_addict",
    name: "SUBWAY ADDICT",
    verified: true,
    likes: 6969696,
    comments: 420069,
    shares: 800813,
    views: 101010101,
    timestamp: "30m",
    hashtags: ["#fyp", "#subwaysurfers", "#brainrot", "#reddit", "#storytime"],
    soundName: "subway surfers + reddit story mashup",
    soundId: "sound-101",
    following: true
  },
  102: {
    id: 102,
    url: "https://github.com/colegottdank/colegottdank/releases/download/v1.0/satisfying-slime.mp4",
    caption: "SLIME STRETCHING COMPILATION AND MY BRAIN HAS OFFICIALLY LEFT THE CHAT 🫠🎨 THE WAY IT MOVES IS ILLEGAL. THE COLORS ARE INSANE. I NEED TO TOUCH SLIME RN",
    username: "slime_stretching",
    name: "SLIME STRETCHING",
    verified: false,
    likes: 5432100,
    comments: 321000,
    shares: 456789,
    views: 87654321,
    timestamp: "2h",
    hashtags: ["#fyp", "#familyguy", "#brainrot", "#predictions", "#conspiracy"],
    soundName: "family guy prediction compilation phonk",
    soundId: "sound-102",
    following: true
  },
  103: {
    id: 103,
    url: "https://github.com/colegottdank/colegottdank/releases/download/v1.0/pressure-washing.mp4",
    caption: "PRESSURE WASHING A DRIVEWAY THATS BEEN DIRTY FOR 10 YEARS 💦😱 THE TRANSFORMATION IS UNREAL. THE BEFORE AND AFTER GAVE ME GOOSEBUMPS. THIS IS BETTER THAN THERAPY",
    username: "powerwash_pro",
    name: "POWERWASH PRO",
    verified: true,
    likes: 7890123,
    comments: 567890,
    shares: 678901,
    views: 98765432,
    timestamp: "5h",
    hashtags: ["#fyp", "#spongebob", "#brainrot", "#iceberg", "#lore"],
    soundName: "spongebob iceberg phonk bass boosted",
    soundId: "sound-103",
    following: true
  },
  104: {
    id: 104,
    url: "https://github.com/colegottdank/colegottdank/releases/download/v1.0/wood-turning.mp4",
    caption: "WOOD TURNING ON A LATHE IS THE MOST SATISFYING THING HUMANS HAVE EVER CREATED 🪵🔄 THE SHAVINGS. THE REVEAL. THE SMOOTH FINISH. I AM MESMERIZED BEYOND REPAIR",
    username: "wood_turning_asmr",
    name: "WOOD TURNING ASMR",
    verified: false,
    likes: 3210000,
    comments: 187000,
    shares: 290000,
    views: 42000000,
    timestamp: "1h",
    hashtags: ["#fyp", "#soapcutting", "#asmr", "#satisfying", "#brainrot"],
    soundName: "soap cutting ASMR original sound",
    soundId: "sound-104",
    following: true
  },
  105: {
    id: 105,
    url: "https://github.com/colegottdank/colegottdank/releases/download/v1.0/laser-cutting.mp4",
    caption: "LASER CUTTING THROUGH METAL LIKE ITS BUTTER 🔴✂️ THE PRECISION IS INHUMAN. THE SPARKS ARE BEAUTIFUL. I HAVE FOUND MY NEW OBSESSION AND ITS LASERS",
    username: "laser_precision",
    name: "LASER PRECISION",
    verified: true,
    likes: 4560000,
    comments: 234000,
    shares: 345000,
    views: 56000000,
    timestamp: "3h",
    hashtags: ["#fyp", "#kineticsand", "#satisfying", "#asmr", "#rainbow"],
    soundName: "kinetic sand original sound",
    soundId: "sound-105",
    following: true
  },
  106: {
    id: 106,
    url: "https://github.com/colegottdank/colegottdank/releases/download/v1.0/rizz-meme.mp4",
    caption: "THIS MAN HAS MORE RIZZ THAN SHOULD BE LEGALLY ALLOWED 🗣️💀 THE CONFIDENCE. THE DELIVERY. THE AUDACITY. I JUST WITNESSED PEAK HUMAN EVOLUTION. RIZZ GOD CONFIRMED",
    username: "rizz_compilation",
    name: "RIZZ COMPILATION",
    verified: true,
    likes: 5670000,
    comments: 345000,
    shares: 456000,
    views: 67000000,
    timestamp: "4h",
    hashtags: ["#fyp", "#gta", "#stunts", "#impossible", "#gaming"],
    soundName: "gta stunt race phonk remix",
    soundId: "sound-106",
    following: true
  },
  107: {
    id: 107,
    url: "https://github.com/colegottdank/colegottdank/releases/download/v1.0/cake-decorating.mp4",
    caption: "THIS CAKE DECORATOR IS NOT HUMAN THERES NO WAY 🎂👽 THE DETAIL ON THE FLOWERS IS INSANE. EVERY PETAL IS PERFECT. REPORT THIS PERSON FOR BEING TOO TALENTED",
    username: "cake_alien",
    name: "CAKE ALIEN",
    verified: false,
    likes: 2340000,
    comments: 156000,
    shares: 234000,
    views: 34000000,
    timestamp: "6h",
    hashtags: ["#fyp", "#cakedecorating", "#satisfying", "#baking", "#talent"],
    soundName: "cake decorating lofi beats",
    soundId: "sound-107",
    following: true
  },
  108: {
    id: 108,
    url: "https://github.com/colegottdank/colegottdank/releases/download/v1.0/pottery-making.mp4",
    caption: "POTTERY ON THE WHEEL IS SO THERAPEUTIC I FORGOT ALL MY PROBLEMS 🏺🤲 THE WAY THE CLAY FORMS IS PURE MAGIC. THE SYMMETRY. THE GLAZE. IM ENROLLING IN POTTERY CLASS",
    username: "pottery_therapy",
    name: "POTTERY THERAPY",
    verified: true,
    likes: 6780000,
    comments: 456000,
    shares: 567000,
    views: 78000000,
    timestamp: "8h",
    hashtags: ["#fyp", "#hydraulicpress", "#science", "#satisfying", "#experiment"],
    soundName: "hydraulic press dramatic phonk",
    soundId: "sound-108",
    following: true
  },
  109: {
    id: 109,
    url: "https://github.com/colegottdank/colegottdank/releases/download/v1.0/spongebob-meme.mp4",
    caption: "SPONGEBOB OUT OF CONTEXT IS THE PUREST FORM OF COMEDY 🧽😂 NO SHOW HAS EVER BEEN THIS UNINTENTIONALLY UNHINGED. THE MEMES WRITE THEMSELVES. PEAK BRAINROT",
    username: "spongebob_brainrot",
    name: "SPONGEBOB BRAINROT",
    verified: false,
    likes: 3890000,
    comments: 234000,
    shares: 345000,
    views: 45000000,
    timestamp: "10h",
    hashtags: ["#fyp", "#candymaking", "#japan", "#satisfying", "#art"],
    soundName: "japanese candy making original sound",
    soundId: "sound-109",
    following: true
  },
  110: {
    id: 110,
    url: "https://github.com/colegottdank/colegottdank/releases/download/v1.0/3d-printing.mp4",
    caption: "3D PRINTING TIMELAPSE AND THE RESULT IS INSANE 🖨️🤯 WATCHING IT BUILD LAYER BY LAYER IS SO HYPNOTIC. THE FUTURE IS NOW. WE ARE LIVING IN THE FUTURE",
    username: "3d_print_daily",
    name: "3D PRINT DAILY",
    verified: true,
    likes: 4560000,
    comments: 345000,
    shares: 456000,
    views: 56000000,
    timestamp: "12h",
    hashtags: ["#fyp", "#minecraft", "#parkour", "#impossible", "#gaming"],
    soundName: "minecraft parkour phonk bass boosted",
    soundId: "sound-110",
    following: true
  },
  111: {
    id: 111,
    url: "https://github.com/colegottdank/colegottdank/releases/download/v1.0/minecraft-meme.mp4",
    caption: "MINECRAFT MEME COMPILATION THAT TURNED MY LAST BRAINCELL INTO A CREEPER 🟩💥 THE EDITS ARE TOO GOOD. THE SOUND EFFECTS. IM CRYING. THIS IS WHAT PEAK CONTENT LOOKS LIKE",
    username: "mc_meme_lord",
    name: "MC MEME LORD",
    verified: false,
    likes: 5670000,
    comments: 456000,
    shares: 567000,
    views: 67000000,
    timestamp: "1d",
    hashtags: ["#fyp", "#templerun", "#worldrecord", "#gaming", "#nostalgia"],
    soundName: "temple run intense phonk remix",
    soundId: "sound-111",
    following: true
  },
  112: {
    id: 112,
    url: "https://github.com/colegottdank/colegottdank/releases/download/v1.0/calligraphy.mp4",
    caption: "CALLIGRAPHY SO PERFECT IT LOOKS PRINTED 🖊️✨ THE INK FLOW. THE LETTER SPACING. THE CONSISTENCY. THIS PERSON'S HANDS ARE A NATIONAL TREASURE. IM IN AWE",
    username: "calligraphy_art",
    name: "CALLIGRAPHY ART",
    verified: true,
    likes: 7890000,
    comments: 567000,
    shares: 678000,
    views: 89000000,
    timestamp: "1d",
    hashtags: ["#fyp", "#subwaysurfers", "#speedrun", "#gaming", "#brainrot"],
    soundName: "subway surfers speedrun phonk",
    soundId: "sound-112",
    following: true
  },

  // Liked Videos (IDs 1001-1100) - These are videos the user liked from other creators
  1001: {
    id: 1001,
    url: "https://github.com/colegottdank/colegottdank/releases/download/v1.0/skibidi-toilet.mp4",
    caption: "SKIBIDI TOILET SEASON 47 JUST DROPPED AND THE PLOT TWIST IS INSANE 🚽🤯 WHO WROTE THIS. WHO APPROVED THIS. THE CINEMA IS UNMATCHED. OSCARS WHEN??",
    username: "skibidi_cinema",
    name: "SKIBIDI CINEMA",
    verified: true,
    likes: 2900000,
    comments: 69000,
    shares: 150000,
    views: 28000000,
    timestamp: "1d",
    hashtags: ["#fyp", "#skibidi", "#brainrot", "#cinema", "#lore"],
    soundName: "skibidi toilet epic battle phonk",
    soundId: "sound-liked-1",
    following: false
  },
  1002: {
    id: 1002,
    url: "https://github.com/colegottdank/colegottdank/releases/download/v1.0/among-us.mp4",
    caption: "AMONG US IN REAL LIFE BUT EVERYONE IS SUS 📮💀 WE PLAYED AMONG US IRL AND BRO ACTUALLY VENTED IN FRONT OF EVERYONE. THE BETRAYAL. THE LIES. AMOGUS IS A LIFESTYLE",
    username: "amogus_irl",
    name: "AMOGUS IRL",
    verified: false,
    likes: 1800000,
    comments: 45000,
    shares: 98000,
    views: 21000000,
    timestamp: "3h",
    hashtags: ["#fyp", "#amongus", "#brainrot", "#sus", "#amogus"],
    soundName: "among us drip theme bass boosted",
    soundId: "sound-liked-2",
    following: false
  },
  1003: {
    id: 1003,
    url: "https://github.com/colegottdank/colegottdank/releases/download/v1.0/family-guy-moments.mp4",
    caption: "FAMILY GUY MOMENTS THAT WOULD GET CANCELLED TODAY 😂💀 HOW DID THEY GET AWAY WITH THIS. PETER GRIFFIN IS THE MOST UNHINGED CHARACTER IN TV HISTORY. NO CAP",
    username: "fg_moments_daily",
    name: "FG MOMENTS DAILY",
    verified: true,
    likes: 2100000,
    comments: 52000,
    shares: 110000,
    views: 24000000,
    timestamp: "5h",
    hashtags: ["#fyp", "#familyguy", "#brainrot", "#cancelled", "#darkhumor"],
    soundName: "family guy funny moments phonk",
    soundId: "sound-liked-3",
    following: false
  },
  1004: {
    id: 1004,
    url: "https://github.com/colegottdank/colegottdank/releases/download/v1.0/candy-making.mp4",
    caption: "CANDY MAKING FACTORY TOUR AND NOW I UNDERSTAND WHY WILLY WONKA WAS UNHINGED 🍭🏭 THE MACHINES ARE HYPNOTIC. THE SUGAR PULLING IS ART. I WANT TO LIVE HERE",
    username: "candy_obsessed",
    name: "CANDY OBSESSED",
    verified: false,
    likes: 3100000,
    comments: 78000,
    shares: 145000,
    views: 32000000,
    timestamp: "12h",
    hashtags: ["#fyp", "#redcircle", "#brainrot", "#impossible", "#challenge"],
    soundName: "where is it phonk bass boosted",
    soundId: "sound-liked-4",
    following: false
  },
  1005: {
    id: 1005,
    url: "https://github.com/colegottdank/colegottdank/releases/download/v1.0/sigma-edit.mp4",
    caption: "SIGMA EDIT COMPILATION THAT TURNED ME INTO A DIFFERENT PERSON 🐺💯 THE PHONK. THE SLOW MO. THE QUOTES. I JUST QUIT MY JOB AND STARTED A GRINDSET. THIS IS NOT A PHASE MOM",
    username: "sigma_daily",
    name: "SIGMA DAILY",
    verified: true,
    likes: 4100000,
    comments: 95000,
    shares: 180000,
    views: 39000000,
    timestamp: "1d",
    hashtags: ["#fyp", "#sigma", "#brainrot", "#grindset", "#phonk"],
    soundName: "sigma phonk edit bass boosted",
    soundId: "sound-liked-5",
    following: false
  },
  1006: {
    id: 1006,
    url: "https://github.com/colegottdank/colegottdank/releases/download/v1.0/spongebob-meme.mp4",
    caption: "SPONGEBOB MEMES THAT LIVE IN MY HEAD RENT FREE 🧽💀 THE KRUSTY KRAB VS CHUM BUCKET MEME FORMAT IS THE GREATEST INVENTION OF MANKIND. CHANGE MY MIND",
    username: "spongebob_daily",
    name: "SPONGEBOB DAILY",
    verified: true,
    likes: 89000,
    comments: 1200,
    shares: 5600,
    views: 1200000,
    timestamp: "2d",
    hashtags: ["#spongebob", "#brainrot", "#unhinged", "#fyp", "#memes"],
    soundName: "spongebob trap remix slowed",
    soundId: "sound-liked-6",
    following: false
  },
  
  // Saved Videos (IDs 2001-2100) - These are videos the user saved from other creators
  2001: {
    id: 2001,
    url: "https://github.com/colegottdank/colegottdank/releases/download/v1.0/minecraft-meme.mp4",
    caption: "saving this minecraft meme compilation for when i need to feel something 🟩💎 the creeper jumpscare edit at 0:23 literally gave me ptsd. peak gaming content",
    username: "mc_meme_saves",
    name: "MC MEME SAVES",
    verified: true,
    likes: 1900000,
    comments: 34000,
    shares: 67000,
    views: 21000000,
    timestamp: "6h",
    hashtags: ["#fyp", "#minecraft", "#brainrot", "#memes", "#gaming"],
    soundName: "minecraft cave sounds phonk remix",
    soundId: "sound-saved-1",
    following: false
  },
  2002: {
    id: 2002,
    url: "https://github.com/colegottdank/colegottdank/releases/download/v1.0/rizz-meme.mp4",
    caption: "saving this rizz compilation because i need to study the technique 🗣️📝 this man is operating on a different frequency. the rizz is too powerful. im taking notes",
    username: "rizz_student",
    name: "RIZZ STUDENT",
    verified: false,
    likes: 1200000,
    comments: 22000,
    shares: 45000,
    views: 15000000,
    timestamp: "1d",
    hashtags: ["#fyp", "#rizz", "#brainrot", "#study", "#technique"],
    soundName: "rizz tutorial phonk remix",
    soundId: "sound-saved-2",
    following: false
  },
  2003: {
    id: 2003,
    url: "https://github.com/colegottdank/colegottdank/releases/download/v1.0/hydraulic-press.mp4",
    caption: "saving this hydraulic press compilation for when i need to feel powerful 🔨💪 watching things get crushed is oddly therapeutic. dont judge me",
    username: "press_fan",
    name: "PRESS FAN",
    verified: true,
    likes: 2100000,
    comments: 38000,
    shares: 89000,
    views: 26000000,
    timestamp: "2d",
    hashtags: ["#fyp", "#ohno", "#brainrot", "#villain", "#origin"],
    soundName: "oh no villain arc phonk",
    soundId: "sound-saved-3",
    following: false
  },
  2004: {
    id: 2004,
    url: "https://github.com/colegottdank/colegottdank/releases/download/v1.0/candy-making.mp4",
    caption: "saving this candy making video because the sugar work is genuinely art 🍬🎨 gonna show this to people who say tiktok is brainrot. this is CULTURE",
    username: "candy_culture",
    name: "CANDY CULTURE",
    verified: true,
    likes: 1500000,
    comments: 28000,
    shares: 56000,
    views: 14000000,
    timestamp: "3d",
    hashtags: ["#fyp", "#redcircle", "#brainrot", "#gaslight", "#menace"],
    soundName: "red circle suspense phonk",
    soundId: "sound-saved-4",
    following: false
  },

  // Current User's Videos (IDs 9001-9100)
  9001: {
    id: 9001,
    url: "https://github.com/colegottdank/colegottdank/releases/download/v1.0/subway-surfers.mp4",
    caption: "FIRST VIDEO LETS GOOO 🏃‍♂️💯 posting subway surfers gameplay as my first vid because the algorithm NEEDS this content. ratio + cope + seethe",
    username: "currentuser",
    name: "You",
    verified: false,
    likes: 69420,
    comments: 1337,
    shares: 8008,
    views: 420000,
    timestamp: "2d",
    hashtags: ["#fyp", "#firstvideo", "#brainrot", "#subwaysurfers", "#grindset"],
    soundName: "first video subway surfers phonk",
    soundId: "sound-user-1",
    following: false
  },
  9002: {
    id: 9002,
    url: "https://github.com/colegottdank/colegottdank/releases/download/v1.0/gta-stunts.mp4",
    caption: "HIT THE MOST INSANE GTA STUNT OF MY LIFE 🏎️💨 THE CAR DID A TRIPLE BACKFLIP OFF THE RAMP AND LANDED PERFECTLY. IM LITERALLY SHAKING. PEAK GAMING MOMENT",
    username: "currentuser",
    name: "You",
    verified: false,
    likes: 42069,
    comments: 999,
    shares: 5000,
    views: 250000,
    timestamp: "5d",
    hashtags: ["#fyp", "#gta", "#brainrot", "#stunts", "#gaming"],
    soundName: "gta stunt race phonk remix",
    soundId: "sound-user-2",
    following: false
  },
  9003: {
    id: 9003,
    url: "https://github.com/colegottdank/colegottdank/releases/download/v1.0/kinetic-sand.mp4",
    caption: "kinetic sand cutting ASMR that i filmed at 3am because the vibes were immaculate 🏖️✂️ the crunch. the colors. im never sleeping again. this is my life now",
    username: "currentuser",
    name: "You",
    verified: false,
    likes: 80085,
    comments: 2000,
    shares: 10000,
    views: 500000,
    timestamp: "1w",
    hashtags: ["#fyp", "#kineticsand", "#brainrot", "#asmr", "#3am"],
    soundName: "kinetic sand ASMR original sound",
    soundId: "sound-user-3",
    following: false
  },

  // EXTRA BRAINROT VIDEOS (IDs 7-20)
  7: {
    id: 7,
    url: "https://github.com/colegottdank/colegottdank/releases/download/v1.0/skibidi-toilet.mp4",
    caption: "SKIBIDI TOILET SEASON 73 JUST DROPPED AND THE LORE IS DEEPER THAN GAME OF THRONES 🚽⚔️ CAMERAMAN VS SCIENTIST TOILET THE FINAL ARC. WHO IS WRITING THIS. OSCAR WORTHY CINEMA",
    username: "skibidi_lore_master",
    name: "SKIBIDI LORE MASTER",
    verified: true,
    likes: 7777777,
    comments: 420420,
    shares: 666666,
    views: 99999999,
    timestamp: "69m",
    hashtags: ["#fyp", "#algorithm", "#brainrot", "#4am", "#subwaysurfers"],
    soundName: "4am subway surfers phonk slowed + reverb",
    soundId: "sound-7",
    following: false
  },
  8: {
    id: 8,
    url: "https://github.com/colegottdank/colegottdank/releases/download/v1.0/cake-decorating.mp4",
    caption: "CAKE DECORATING THAT IS SO SATISFYING IT SHOULD BE ILLEGAL 🎂✨ HOW ARE THEIR HANDS SO STEADY. THE FROSTING IS IMMACULATE. I CANT LOOK AWAY. MY BRAIN IS COOKED",
    username: "cake_perfection",
    name: "CAKE PERFECTION",
    verified: false,
    likes: 5555555,
    comments: 333333,
    shares: 444444,
    views: 77777777,
    timestamp: "3h",
    hashtags: ["#fyp", "#skibidi", "#brainrot", "#cameraman", "#battle"],
    soundName: "skibidi vs cameraman epic phonk",
    soundId: "sound-8",
    following: true
  },
  9: {
    id: 9,
    url: "https://github.com/colegottdank/colegottdank/releases/download/v1.0/family-guy-moments.mp4",
    caption: "FAMILY GUY OUT OF CONTEXT MOMENTS THAT BROKE MY BRAIN PERMANENTLY 😂💀 PETER GRIFFIN DID NOT JUST DO THAT. HOW DID THIS AIR ON TELEVISION. THE WRITERS ARE UNHINGED",
    username: "fg_unhinged",
    name: "FG UNHINGED",
    verified: true,
    likes: 8888888,
    comments: 555555,
    shares: 777777,
    views: 88888888,
    timestamp: "6h",
    hashtags: ["#fyp", "#familyguy", "#brainrot", "#darkhumor", "#compilation"],
    soundName: "family guy dark humor phonk remix",
    soundId: "sound-9",
    following: false
  },
  10: {
    id: 10,
    url: "https://github.com/colegottdank/colegottdank/releases/download/v1.0/sigma-edit.mp4",
    caption: "SIGMA MALE PHONK EDIT THAT GOES SO HARD IT SHOULD BE CLASSIFIED AS A WEAPON 🐺🔥 THE SLOW MO. THE BASS. THE GRINDSET. I JUST BECAME 47% MORE PRODUCTIVE WATCHING THIS",
    username: "sigma_phonk_edits",
    name: "SIGMA PHONK EDITS",
    verified: false,
    likes: 4444444,
    comments: 222222,
    shares: 333333,
    views: 66666666,
    timestamp: "9h",
    hashtags: ["#fyp", "#spongebob", "#brainrot", "#theories", "#iceberg"],
    soundName: "spongebob theory phonk creepy",
    soundId: "sound-10",
    following: true
  },
  11: {
    id: 11,
    url: "https://github.com/colegottdank/colegottdank/releases/download/v1.0/among-us.mp4",
    caption: "AMONG US ANIMATION BUT ITS ACTUALLY PEAK CINEMA 📮💀 THE IMPOSTER REVEAL HAD ME SCREAMING. SUS DOESNT EVEN BEGIN TO DESCRIBE IT. THE BETRAYAL. THE DRAMA. AMOGUS",
    username: "amogus_cinema",
    name: "AMOGUS CINEMA",
    verified: true,
    likes: 9999999,
    comments: 666666,
    shares: 888888,
    views: 111111111,
    timestamp: "12h",
    hashtags: ["#fyp", "#ohno", "#brainrot", "#reactions", "#firsttime"],
    soundName: "oh no reaction compilation phonk",
    soundId: "sound-11",
    following: false
  },
  12: {
    id: 12,
    url: "https://github.com/colegottdank/colegottdank/releases/download/v1.0/glass-blowing.mp4",
    caption: "GLASS BLOWING IS LITERALLY MAGIC AND YOU CANNOT CONVINCE ME OTHERWISE 🔥🫧 THE WAY THE MOLTEN GLASS MOVES IS HYPNOTIC. I HAVE BEEN WATCHING FOR 6 HOURS. HELP",
    username: "glass_magic",
    name: "GLASS MAGIC",
    verified: true,
    likes: 6969696,
    comments: 420069,
    shares: 800813,
    views: 101010101,
    timestamp: "15h",
    hashtags: ["#fyp", "#glassblowing", "#satisfying", "#art", "#mesmerizing"],
    soundName: "glass blowing ambient sounds",
    soundId: "sound-12",
    following: true
  }
};

// Helper function to get video by ID from registry
export function getVideoById(id: number): Video | undefined {
  return videoRegistry[id];
}

// Helper function to check if a video exists in registry
export function videoExists(id: number): boolean {
  return id in videoRegistry;
}

// Export video arrays from registry
export const sampleVideos: Video[] = [
  videoRegistry[1], videoRegistry[2], videoRegistry[3], 
  videoRegistry[4], videoRegistry[5], videoRegistry[6],
  videoRegistry[7], videoRegistry[8], videoRegistry[9],
  videoRegistry[10], videoRegistry[11], videoRegistry[12]
];

export const mockLikedVideos: Video[] = [
  videoRegistry[1001], videoRegistry[1002], videoRegistry[1003], 
  videoRegistry[1004], videoRegistry[1005], videoRegistry[1006]
];

// Comments
export interface Comment {
  id: number;
  videoId: number;
  username: string;
  text: string;
  likes: number;
  time: string;
}

// Device preferences (localStorage) — the ONLY local state that survives the API migration.
const MUTE_PREF_KEY = 'cg_muted';

export function getMutedPref(): boolean {
  if (typeof window === 'undefined') return true;
  const v = localStorage.getItem(MUTE_PREF_KEY);
  return v === null ? true : v === '1';
}

export function setMutedPref(muted: boolean): void {
  if (typeof window !== 'undefined') localStorage.setItem(MUTE_PREF_KEY, muted ? '1' : '0');
}

// LocalStorage helper functions
const STORAGE_KEY = 'tiktok_clone_data';

export interface UserState {
  likedVideos: number[];
  savedVideos: number[];
  following: string[];
  comments: Comment[];
  viewedVideos: number[];
  searchHistory: string[];
  notifications: Notification[];
  messages: Message[];
  likedComments: number[];
}

export interface Notification {
  id: number;
  type: 'like' | 'comment' | 'follow' | 'mention';
  username: string;
  text: string;
  read: boolean;
  timestamp: string;
}

export interface Message {
  id: number;
  username: string;
  text: string;
  timestamp: string;
  read: boolean;
  sent?: boolean;
}

export function getUserState(): UserState {
  if (typeof window === 'undefined') {
    return {
      likedVideos: [],
      savedVideos: [],
      following: [],
      comments: [],
      viewedVideos: [],
      searchHistory: [],
      notifications: [],
      messages: [],
      likedComments: []
    };
  }
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const parsed = JSON.parse(stored);
    // Ensure likedComments exists for backward compatibility
    if (!parsed.likedComments) {
      parsed.likedComments = [];
    }
    return parsed;
  }
  
  return {
    likedVideos: [],
    savedVideos: [],
    following: [],
    comments: [],
    viewedVideos: [],
    searchHistory: [],
    notifications: [],
    messages: [],
    likedComments: []
  };
}

export function saveUserState(state: UserState) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}

// Following functions
export function isFollowing(username: string): boolean {
  const state = getUserState();
  return state.following.includes(username);
}

export function followUser(username: string) {
  const state = getUserState();
  if (!state.following.includes(username)) {
    state.following.push(username);
    saveUserState(state);
  }
}

export function unfollowUser(username: string) {
  const state = getUserState();
  state.following = state.following.filter(u => u !== username);
  saveUserState(state);
}

// Search history
export function addToSearchHistory(query: string) {
  const state = getUserState();
  if (!state.searchHistory.includes(query)) {
    state.searchHistory.unshift(query);
    if (state.searchHistory.length > 10) {
      state.searchHistory.pop();
    }
    saveUserState(state);
  }
}

// Mock Watch History
export interface WatchHistoryItem {
  video: Video;
  watchedAt: string;
  progress: number;
}

export const mockWatchHistory: WatchHistoryItem[] = [
  { video: sampleVideos[0], watchedAt: '2 hours ago', progress: 85 },
  { video: sampleVideos[1], watchedAt: '3 hours ago', progress: 100 },
  { video: sampleVideos[2], watchedAt: '5 hours ago', progress: 60 },
  { video: sampleVideos[3], watchedAt: '8 hours ago', progress: 100 },
  { video: sampleVideos[4], watchedAt: '1 day ago', progress: 45 },
  { video: sampleVideos[5], watchedAt: '2 days ago', progress: 90 },
  { video: mockLikedVideos[0], watchedAt: '2 days ago', progress: 100 },
  { video: mockLikedVideos[1], watchedAt: '3 days ago', progress: 75 }
];

// Mock Blocked Users
export interface BlockedUser {
  username: string;
  name: string;
  avatar: string;
  blockedAt: string;
  reason?: string;
}

export const mockBlockedUsers: BlockedUser[] = [
  {
    username: 'spammer123',
    name: 'Spam Account',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=spammer123',
    blockedAt: '3 days ago',
    reason: 'Spam'
  },
  {
    username: 'toxic_gamer',
    name: 'Toxic User',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=toxic_gamer',
    blockedAt: '1 week ago',
    reason: 'Harassment'
  },
  {
    username: 'fake_profile',
    name: 'Fake Account',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fake_profile',
    blockedAt: '2 weeks ago',
    reason: 'Impersonation'
  }
];

// Mock Muted Users
export interface MutedUser {
  username: string;
  name: string;
  avatar: string;
  mutedAt: string;
}

export const mockMutedUsers: MutedUser[] = [
  {
    username: 'annoying_user',
    name: 'Annoying Person',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=annoying_user',
    mutedAt: '1 week ago'
  },
  {
    username: 'too_many_posts',
    name: 'Post Overload',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=too_many_posts',
    mutedAt: '3 days ago'
  },
  {
    username: 'off_topic',
    name: 'Random Content',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=off_topic',
    mutedAt: '5 days ago'
  }
];

// Report reasons
export const reportReasons = [
  { id: 'spam', label: 'Spam', description: 'Misleading or repetitive content' },
  { id: 'harassment', label: 'Harassment or bullying', description: 'Targeting someone with harmful behavior' },
  { id: 'hate', label: 'Hate speech', description: 'Content attacking protected groups' },
  { id: 'violence', label: 'Violence or dangerous organizations', description: 'Promoting violence or extremist groups' },
  { id: 'misinformation', label: 'Misinformation', description: 'False information that could cause harm' },
  { id: 'ip', label: 'Intellectual property violation', description: 'Using content without permission' },
  { id: 'other', label: 'Something else', description: 'Another reason not listed above' }
];

// Privacy settings interface
export interface PrivacySettings {
  privateAccount: boolean;
  likedVideosVisibleTo: 'everyone' | 'friends' | 'only_me';
  profileViewsEnabled: boolean;
  allowDownloads: boolean;
  suggestAccountToOthers: boolean;
  showActivityStatus: boolean;
}

export const defaultPrivacySettings: PrivacySettings = {
  privateAccount: false,
  likedVideosVisibleTo: 'everyone',
  profileViewsEnabled: true,
  allowDownloads: true,
  suggestAccountToOthers: true,
  showActivityStatus: true
};

