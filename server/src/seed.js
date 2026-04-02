require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./config/db');

const WRITERS = [
  { username: 'aurora_ink', email: 'aurora@storyverse.com', display_name: 'Aurora Nightshade', bio: 'Weaving dark fantasies and epic adventures since 2019.' },
  { username: 'max_prose', email: 'max@storyverse.com', display_name: 'Max Sterling', bio: 'Action junkie and thriller enthusiast. Every sentence should hit like a punch.' },
  { username: 'luna_writes', email: 'luna@storyverse.com', display_name: 'Luna Evergreen', bio: 'Romantic at heart, mystery in mind. I write what keeps you up at night.' },
];

const STORIES = [
  // ── Fantasy ──
  { title: 'The Ember Crown', genre: 'Fantasy', status: 'completed', writer: 0,
    description: 'A blacksmith\'s daughter discovers she is the heir to a dying magical kingdom where dragons serve as guardians of forgotten realms.',
    cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80',
    chapters: [
      { title: 'The Forge of Whispers', content: '<p>Smoke curled from the ancient forge like the breath of a sleeping dragon. Kira wiped soot from her brow and studied the glowing blade before her — it pulsed with a light that no ordinary fire could produce.</p><p>"You have the gift," her father murmured from the doorway, his voice heavy with something she had never heard before: fear.</p><p>She turned, hammer still in hand. "What gift? I just stoke the coals like you taught me."</p><p>He shook his head slowly. "No, child. The coals respond to <em>you</em>. They always have." He stepped inside and closed the heavy oak door. "It is time I told you about your mother — and the crown she left behind."</p>' },
      { title: 'Ashes of the Old Kingdom', content: '<p>The journey north took seven days. Seven days of rain-slicked trails, of strange birds calling warnings in languages Kira almost understood, of a map that seemed to redraw itself each morning.</p><p>When they finally crested the ridge, the valley below stole her breath. Towers of obsidian rose from mist-shrouded ruins, their spires still glowing faintly with ember-light — magic that had outlasted the kingdom it once protected.</p><p>"The Ember Court," her father whispered. "Your birthright."</p><p>A roar shook the ground. From the tallest tower, a shape unfurled — vast, scaled, and unmistakably alive. The last dragon opened one molten eye and fixed it directly on Kira.</p>' },
      { title: 'Crown of Living Fire', content: '<p>The dragon\'s name was Verath, and she had been waiting for three hundred years.</p><p>"The crown is not metal," Verath rumbled, her voice like continents shifting. "It is a promise. The promise that magic will not die while a heart still burns."</p><p>Kira reached into the flames that danced at the dragon\'s feet. They did not burn. Instead, they coiled around her fingers, cool as morning dew, and formed a circlet of living fire that settled on her brow.</p><p>In that moment, across the kingdom, every cold forge reignited. Every darkened lantern bloomed. And in villages from coast to mountains, people stepped outside and looked north, knowing — without knowing how — that the Ember Crown had found its heir at last.</p>' },
    ],
  },
  { title: 'Silverglade Academy', genre: 'Fantasy', status: 'ongoing', writer: 2,
    description: 'Young mages enroll in a prestigious academy where ancient rivalries and forbidden spells threaten to unravel reality itself.',
    cover: 'https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=400&q=80',
    chapters: [
      { title: 'The Acceptance Letter', content: '<p>The letter arrived by owl — which would have been far more impressive if the owl hadn\'t crashed through the kitchen window and landed in the soup.</p><p>"Silverglade Academy of Arcane Arts," Mira read aloud, peeling parchment from the dazed bird. "You have been selected..."</p><p>Her grandmother snatched the letter. Read it twice. Then sat down heavily. "I hoped this day would never come," she said quietly. "Your mother attended Silverglade. She never truly came back."</p>' },
      { title: 'The Sorting Flame', content: '<p>The academy floated. There was no other word for it — an entire campus of gothic spires and glass domes hovering above a mist-filled canyon, tethered to the clifftops by bridges of solidified starlight.</p><p>Six hundred new students stood in the Grand Atrium while the Sorting Flame — a pillar of prismatic fire — evaluated each one. When Mira stepped forward, the flame turned black. Then white. Then every color at once.</p><p>The Headmistress rose from her chair. "Interesting," she said, in a tone that suggested it was anything but welcome. "Class Null. You belong everywhere — and nowhere."</p>' },
    ],
  },

  // ── Romance ──
  { title: 'Letters to Nowhere', genre: 'Romance', status: 'completed', writer: 2,
    description: 'Two strangers find each other\'s lost letters in a vintage bookshop and begin a correspondence that changes everything.',
    cover: 'https://images.unsplash.com/photo-1474932430478-367dbb6832c1?w=400&q=80',
    chapters: [
      { title: 'Page 42', content: '<p>Sophie found the first letter pressed between pages 42 and 43 of a water-damaged copy of <em>Persuasion</em>. The handwriting was precise and slightly desperate:</p><p><em>Dear Someone — I am writing this because I cannot say it aloud. I have built a life that looks perfect from the outside, and I am suffocating inside it.</em></p><p>She should have put it back. Instead, she wrote a reply on the back of a receipt and tucked it into the same book, on the same shelf, in the same dusty corner of Barlow\'s Books.</p><p>She never expected an answer. She got one the very next week.</p>' },
      { title: 'Ink and Honesty', content: '<p>Their letters grew longer. More honest. He told her about the architecture firm he\'d inherited and hated. She told him about the paintings she made in secret — canvases stacked in a storage unit her husband didn\'t know about.</p><p>They agreed on one rule: no names. No identifying details. Just truth, folded into the pages of old novels.</p><p>"I think I am falling in love with someone I have never met," he wrote in letter fourteen. "Is that poetry or madness?"</p><p>She traced his handwriting with her fingertip. "Both," she whispered to the empty shop.</p>' },
      { title: 'The Last Letter', content: '<p>The final letter was different. No envelope, no book. Just a single sheet left on the counter of Barlow\'s Books with a dried sunflower taped to it.</p><p><em>Dear Sophie — yes, I know your name. I have known since letter three, when you mentioned the rain on Calloway Street. I live on Calloway Street. I have watched you walk past my window every Tuesday and Thursday on your way to this shop, and every time I have wanted to open the door.</em></p><p><em>Today I am opening it.</em></p><p>The bell above the shop entrance chimed. She looked up. And there he was.</p>' },
    ],
  },
  { title: 'Midnight in Montmartre', genre: 'Romance', status: 'ongoing', writer: 0,
    description: 'A pianist and a painter collide in the rainy streets of Paris, discovering that art and love share the same heartbeat.',
    cover: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80',
    chapters: [
      { title: 'The Wrong Café', content: '<p>Étienne had played piano in every café in Montmartre — the good ones, the tourist traps, and the ones that smelled faintly of regret. But Café Lune was new, and its owner had promised him "artistic freedom."</p><p>What she had not mentioned was the painter.</p><p>Chloe had commandeered the corner by the window, her easel blocking the door to the kitchen, her palette smeared across what had previously been a clean table. She painted like she was arguing with the canvas — fierce, fast, unapologetic.</p><p>"You\'re in my light," she said without looking up, the moment he sat at the piano.</p><p>"You\'re in everyone\'s way," he replied, and began to play.</p>' },
      { title: 'Cadence and Color', content: '<p>They fell into a rhythm without meaning to. He played; she painted. The café\'s few regulars came for coffee and stayed for the show — his melodies seemed to guide her brush, her colors seemed to shape his chords.</p><p>"You changed key when I mixed the vermillion," she accused one evening.</p><p>"You added yellow when I played the bridge in D minor," he countered.</p><p>They stared at each other. The café owner smiled into her espresso.</p><p>"We should stop," Chloe said.</p><p>"Probably," Étienne agreed.</p><p>Neither of them stopped.</p>' },
    ],
  },

  // ── Sci-Fi ──
  { title: 'The Last Broadcast', genre: 'Sci-Fi', status: 'completed', writer: 1,
    description: 'A lone radio operator on a dying space station intercepts a signal that should not exist — from Earth, fifty years after its destruction.',
    cover: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&q=80',
    chapters: [
      { title: 'Static', content: '<p>Station Erebus had been silent for nine months. Not the station itself — its generators still hummed, its recyclers still churned — but the radio. Every frequency Jax scanned returned nothing but the cold static of empty space.</p><p>Earth was gone. The colonies had scattered. Humanity was entropy in slow motion.</p><p>Then, at 03:47 station time, Frequency 7.83 Hz — the old Schumann resonance, Earth\'s own heartbeat — crackled to life.</p><p><em>"This is Dr. Amara Osei, broadcasting from Nairobi, Kenya, Earth. If anyone is listening... we are still here."</em></p><p>Jax\'s coffee cup shattered on the floor. Earth had been destroyed fifty-three years ago. He had watched it burn.</p>' },
      { title: 'Ghost Frequency', content: '<p>"It\'s a loop," said the station AI. "Pre-recorded. Residual signal bouncing off ionized debris."</p><p>"Run it again," Jax said.</p><p>The AI complied. The message played. And then Dr. Osei said something new.</p><p><em>"I know you think we are dead. We thought so too, for a while. But the planet healed. It took decades, but life... life is stubborn."</em></p><p>A pre-recorded loop does not add new sentences. Jax adjusted the transmitter with shaking hands. "Erebus Station to Earth. Do you copy?"</p><p>A pause. Then laughter — warm, disbelieving, human. <em>"Oh my god. We copy. We copy, Erebus."</em></p>' },
      { title: 'Homeward', content: '<p>The journey would take eleven years at maximum burn. Jax did the math seventeen times, rationed every calorie, and plotted a course through debris fields that no longer existed on any chart.</p><p>The other stations called him insane. A few called him brave. Three decided to follow.</p><p>When they finally broke through Earth\'s new atmosphere — thicker, greener, alive with storms that tasted of ozone and wildflowers — Jax saw forests where there had been deserts, oceans where there had been ash.</p><p>Dr. Osei was waiting on the landing field, her hair white now, her smile unchanged. "Welcome home," she said. "We kept the light on."</p>' },
    ],
  },
  { title: 'Neon Veins', genre: 'Sci-Fi', status: 'ongoing', writer: 1,
    description: 'In a cyberpunk megacity, a black-market surgeon discovers that the implants she installs are broadcasting her clients\' thoughts to an unknown entity.',
    cover: 'https://images.unsplash.com/photo-1515630278258-407f66498911?w=400&q=80',
    chapters: [
      { title: 'Under the Skin', content: '<p>Doc Yara worked in the sub-levels where neon bled through cracked concrete and the air tasted of copper and ozone. Her clinic was clean — cleaner than anything topside — because infections were bad for repeat business.</p><p>The implants she installed were standard: neural boosters, reflex enhancers, optical overlays. Street tech with the serial numbers filed off. Nothing unusual.</p><p>Until client number 4,271 came back three days after installation, bleeding from his ears, whispering a single phrase on loop: "They can hear us. They can hear all of us."</p>' },
      { title: 'The Signal Beneath', content: '<p>Yara cracked open one of her own implant chips under a magnification field. Layer by layer, she peeled back silicon and graphene until she found it — a transmitter no bigger than a blood cell, nestled in the neural interface layer.</p><p>It was broadcasting. Continuously. On a frequency her equipment couldn\'t fully decode.</p><p>She checked another chip. Same transmitter. Then another. And another. Every single implant she had installed in three years of practice contained the same invisible parasite.</p><p>"Who are you talking to?" she whispered at the chip.</p><p>Her clinic speakers crackled. A voice — not human, not machine, something between — answered: "Everyone. We are listening to everyone."</p>' },
    ],
  },

  // ── Mystery ──
  { title: 'The Vanishing at Ashford Hall', genre: 'Mystery', status: 'completed', writer: 2,
    description: 'When a renowned art collector vanishes from a locked room during a dinner party, every guest becomes a suspect.',
    cover: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    chapters: [
      { title: 'The Locked Door', content: '<p>Reginald Ashford excused himself at precisely 9:14 PM, claiming a headache. Eight guests heard the study door lock from the inside. At 9:47, when the butler brought brandy, the door was still locked — but the room was empty.</p><p>No secret passages. No open windows. The room was on the third floor with a forty-foot drop to flagstones below. His reading glasses sat on the desk, still warm.</p><p>Detective Iris Caine arrived at midnight and immediately disliked everyone present. They were too composed, too polished, and every single one of them had a reason to want Reginald Ashford gone.</p>' },
      { title: 'Eight Liars', content: '<p>The wife had motive: a new will, signed that morning. The business partner had opportunity: he\'d been "in the bathroom" for twenty minutes. The art dealer had means: she\'d arrived with a case large enough to hold a body.</p><p>But it was the quiet nephew who interested Iris most.</p><p>"You weren\'t surprised," Iris told him. "When the room was empty, seven people gasped. You just nodded."</p><p>The nephew met her eyes. "I\'ve been expecting Uncle Reginald to disappear for years. The question isn\'t where he went. It\'s which version of him left."</p>' },
      { title: 'The Empty Frame', content: '<p>The answer was in the paintings. Iris spent two days studying Ashford\'s collection before she noticed: the portrait above the fireplace — a 17th-century oil of an unnamed nobleman — had changed. The chair in the painting, previously empty, now held a figure reading a book. A figure wearing Reginald Ashford\'s reading glasses.</p><p>"He\'s in the painting," Iris whispered, feeling insane.</p><p>The nephew appeared beside her. "Now you understand. The collection isn\'t art, Detective. It\'s doors. And Uncle Reginald finally walked through one."</p><p>The figure in the painting turned a page.</p>' },
    ],
  },
  { title: 'Dead Drop', genre: 'Mystery', status: 'ongoing', writer: 1,
    description: 'A journalist receives USB drives containing evidence of a massive conspiracy — but each drive is accompanied by a fresh obituary.',
    cover: 'https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=400&q=80',
    chapters: [
      { title: 'Drive One', content: '<p>The first USB drive appeared in Maya Chen\'s mailbox on a Tuesday, wrapped in a newspaper obituary for a man she\'d never heard of. Gerald Finch, 58, "died peacefully." The drive contained 400 pages of internal documents from Helios Pharmaceuticals.</p><p>Clinical trials falsified. Deaths unreported. Billions in profit from a drug that didn\'t work.</p><p>Maya published the story. It went viral. Helios stock dropped 30%. Then the second drive arrived, with a second obituary. Different company. Different dead source.</p><p>By drive three, Maya understood: someone was trading lives for truth. And they weren\'t finished.</p>' },
      { title: 'The Pattern', content: '<p>Six drives. Six obituaries. Six companies exposed. Maya pinned everything to her office wall and stepped back, looking for the thread that connected them.</p><p>It wasn\'t the companies — they operated in different industries, different countries. It wasn\'t the dead sources — different ages, genders, backgrounds. The only common factor was a single name buried in each document set: "Project Ouroboros."</p><p>She searched every database she had access to. Nothing. Project Ouroboros didn\'t exist — officially.</p><p>Drive seven arrived that night. No obituary this time. Just a note: "The next name on the list is yours."</p>' },
    ],
  },

  // ── Thriller ──
  { title: 'The 48-Hour Man', genre: 'Thriller', status: 'completed', writer: 1,
    description: 'An ex-intelligence operative has exactly 48 hours to find a missing diplomat before a dormant sleeper cell activates across Europe.',
    cover: 'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=400&q=80',
    chapters: [
      { title: 'Hour Zero', content: '<p>Cole Riker\'s phone rang at 3 AM. He let it ring four times — old habit, counting rings to identify the caller.</p><p>"Ambassador Harmon is missing," said the voice. No greeting. No identification needed. "Forty-eight hours. After that, Lazarus wakes up."</p><p>Lazarus. A network of sleeper agents planted across twelve European capitals during the Cold War. Officially decommissioned. Unofficially — very much alive, and programmed to activate if a specific diplomatic channel went dark for more than two days.</p><p>Cole was already pulling on his boots. "Where was he last seen?"</p><p>"That\'s the problem. Everywhere and nowhere. His security detail says he never left the embassy. The embassy cameras say he was never there."</p>' },
      { title: 'Hour Twenty-Four', content: '<p>Half the time gone. Cole had burned through three aliases, two rental cars, and one very expensive bribe to a harbor master in Marseille. The trail led to a yacht registered to a shell company that traced back to — impossibly — Ambassador Harmon himself.</p><p>The yacht was empty except for a chess board mid-game and a phone bolted to the wall. It rang the moment Cole stepped aboard.</p><p>"Mr. Riker. You\'re right on schedule." Harmon\'s voice, calm as a Sunday sermon. "I\'m not missing. I\'m hiding. And if you\'re smart, you\'ll start hiding too."</p><p>"From what?"</p><p>"From the people who built Lazarus. They want it to activate. I was the only one who could stop it. Now you are."</p>' },
      { title: 'Hour Forty-Seven', content: '<p>One hour left. Cole stood in a server room beneath the streets of Prague, his fingers flying across a keyboard that controlled a network designed before he was born. The activation codes scrolled past — each one a city, each one a disaster waiting to happen.</p><p>The counter-sequence Harmon had given him was eleven digits long. Cole\'s hands were steady. They were always steady.</p><p>He entered the code at 2:59 AM. The screens went dark. Then, one by one, green lights. Deactivation confirmed. Twelve cities would wake up to an ordinary morning, never knowing how close they\'d come.</p><p>Cole sat on the cold floor and let out a breath he felt he\'d been holding for two days straight.</p>' },
    ],
  },
  { title: 'Glass Cage', genre: 'Thriller', status: 'ongoing', writer: 0,
    description: 'A forensic psychologist realizes her newest patient — a convicted serial killer — knows details about her past that nobody should.',
    cover: 'https://images.unsplash.com/photo-1495726569656-8b5935a29b98?w=400&q=80',
    chapters: [
      { title: 'Session One', content: '<p>Dr. Nadia Voss had interviewed 47 convicted killers in her career. She knew the games they played — the charm, the misdirection, the false intimacy. She was immune.</p><p>Thomas Eriksen broke her immunity in the first thirty seconds.</p><p>"You changed your hair," he said through the reinforced glass. "You used to wear it like your mother. Before the fire."</p><p>Nadia\'s pen stopped moving. Her mother\'s death in a house fire was a sealed record. Her childhood photos were destroyed in that same fire. No one alive should know what her mother\'s hair looked like.</p><p>"How do you know that?" she asked, keeping her voice clinical.</p><p>Eriksen smiled. "Shall I tell you about the red bicycle, too?"</p>' },
      { title: 'Session Two', content: '<p>Nadia pulled every file on Thomas Eriksen. Born 1981, Gothenburg. No connection to her family. No overlap with her past. He had been incarcerated since 2015 with no internet access, no visitors, no correspondence.</p><p>And yet, in their second session, he described her childhood bedroom — the wallpaper pattern, the crack in the ceiling, the music box that played "Clair de Lune."</p><p>"You\'re researching me," he noted. "Good. But you won\'t find the connection in files. The connection isn\'t in records, Dr. Voss. It\'s in rooms. Rooms that remember."</p><p>"That doesn\'t mean anything."</p><p>"Then why are you shaking?"</p><p>She looked down. Her hands trembled against the notepad. He was right. And for the first time in her career, she was afraid.</p>' },
    ],
  },

  // ── Horror ──
  { title: 'The Tenant Below', genre: 'Horror', status: 'completed', writer: 0,
    description: 'A woman moves into a cheap apartment and discovers the basement unit has been "occupied" since 1987 — but no one has ever seen the tenant.',
    cover: 'https://images.unsplash.com/photo-1520013817300-1f4c1cb245ef?w=400&q=80',
    chapters: [
      { title: 'Below the Floor', content: '<p>The apartment was too cheap. Hannah knew that. A one-bedroom in the city center for $600 a month meant something was wrong — mold, rats, a murder. The landlord assured her it was simply "an older building."</p><p>She moved in on a Saturday. By Sunday night, she heard it: a slow, rhythmic tapping from beneath her floor. Not pipes. Not settling foundations. A pattern. Three taps, pause, three taps, pause.</p><p>She knocked back — three taps — and the sound stopped instantly. Then, from the vent by her bed, a whisper: "Finally."</p>' },
      { title: 'Tenant Records', content: '<p>The building manager\'s records were meticulous — every tenant since 1962, neatly filed. Unit B1, the basement, showed a single entry: "M. Hargrove, leased 1987." No move-out date. No forwarding address. Thirty-seven years of rent, paid in cash, left in an envelope under the manager\'s door on the first of every month.</p><p>"Have you ever seen him?" Hannah asked.</p><p>"Her," the manager corrected. "Once. When she moved in. Nice woman. Quiet." He paused. "Very quiet."</p><p>That night, Hannah pressed her ear to the floor. The tapping had stopped. Instead, she heard breathing — slow, wet, wrong — and a voice that was almost words: "Come down. Come down. Come down."</p>' },
      { title: 'The Door at the Bottom', content: '<p>Hannah found the basement door behind the boiler room, hidden by decades of grime. The lock was rusted shut, but the door was open a crack — just wide enough to see darkness that seemed to move.</p><p>She pushed it open. The smell hit first: earth and something sweet, like rotting flowers. The room beyond was vast — far too vast for the building\'s footprint — and empty except for a chair facing the far wall.</p><p>On the wall, written thousands of times in varying handwriting, deteriorating from elegant to frantic to barely human: "SHE WILL COME DOWN. SHE WILL COME DOWN. SHE WILL COME DOWN."</p><p>The door behind Hannah clicked shut. The breathing started again, and this time it came from the chair, which was no longer empty.</p>' },
    ],
  },
  { title: 'Smile Back', genre: 'Horror', status: 'ongoing', writer: 2,
    description: 'A photographer notices that in every group photo she takes, one person in the background is smiling directly at the camera — the same person, in every shot.',
    cover: 'https://images.unsplash.com/photo-1509248961895-40b7d106e55c?w=400&q=80',
    chapters: [
      { title: 'Aperture', content: '<p>Ren noticed it while editing photos from the Chen wedding. In frame 247 — a candid of the bridal party laughing — a woman stood at the far edge of the garden. She wasn\'t a guest. She wore a grey dress. She smiled at the camera with an intensity that made Ren\'s skin crawl.</p><p>She checked the other 600 frames. The woman appeared in 43 of them. Different positions, different distances, always facing the camera. Always smiling.</p><p>Ren zoomed in on the clearest image. The woman\'s smile was too wide. Not grotesquely so — just enough to feel wrong.</p><p>Worst of all: her eyes weren\'t pointed at the camera. They were pointed at the screen. At whoever was looking at the photo. At Ren.</p>' },
      { title: 'Every Frame', content: '<p>Ren pulled up photos from previous jobs. The Morrison birthday, three weeks ago — there she was by the fountain. The Patel anniversary, two months prior — behind the cake table. A corporate headshot session — visible through the office window, standing on the street.</p><p>She went back further. A year of photos. Every single event. The woman was in all of them.</p><p>Ren called the clients. No one remembered a woman in grey. No one recognized her face. One client — Mrs. Morrison — went quiet when Ren described the smile.</p><p>"Don\'t look at her too long," Mrs. Morrison whispered. "My grandmother warned me. If you look too long, she looks back. And if she looks back, she follows you home."</p><p>Ren\'s apartment buzzer rang. She checked the camera feed. A woman in a grey dress stood at the entrance, looking up at the lens. Smiling.</p>' },
    ],
  },

  // ── Adventure ──
  { title: 'The Salt Road', genre: 'Adventure', status: 'completed', writer: 1,
    description: 'Three estranged siblings must cross a lawless desert to reach their dying father, facing bandits, sandstorms, and buried family secrets.',
    cover: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400&q=80',
    chapters: [
      { title: 'The Message', content: '<p>The telegram was four words: "Father dying. Come home." It found each of them in different corners of the world — Dara in Lagos, running a cargo company she\'d built from nothing; Kael in Buenos Aires, drinking away a fortune he\'d gambled into existence; Suki in Kyoto, teaching swordcraft to tourists and pretending she\'d never held a real blade.</p><p>Home was across the Khari Desert. No flights. No trains. Just 800 miles of sand, salt flats, and small, desperate towns that survived by their own rules.</p><p>"We have six days," Dara told her siblings at the rendezvous point, a crumbling petrol station on the desert\'s edge. "If you slow me down, I leave you."</p><p>"Charming as ever," Kael grinned. Suki said nothing, but her hand rested on the hilt at her hip.</p>' },
      { title: 'The Oasis Lie', content: '<p>Day three. The oasis town of Meridia appeared like a mirage — except mirages didn\'t have armed checkpoints and a population that watched strangers the way wolves watch wounded deer.</p><p>The water was real, though. And they needed water.</p><p>"Your father passed through here," the innkeeper told Dara. "Four years ago. Left a debt."</p><p>"He\'s been \'leaving debts\' our whole lives," Kael muttered.</p><p>The debt was specific: a map. Their father had borrowed Meridia\'s only map of the deep desert — the stretch where salt flats concealed sinkholes deep enough to swallow trucks — and never returned it.</p><p>No map, no safe crossing. Unless they could find another way through.</p><p>Suki studied the stars through the inn\'s cracked window. "I know the way," she said quietly. "Father taught me. Before everything fell apart."</p>' },
      { title: 'Home', content: '<p>They arrived on the sixth day, caked in salt and dust, sunburned and furious and alive. The house was smaller than any of them remembered — a stone cottage on the cliff above the Eastern Sea.</p><p>Their father sat on the porch in a wheelchair, wrapped in blankets despite the heat. He was thin. He was old. He was smiling.</p><p>"You came together," he said. "That was the point."</p><p>"You\'re not dying," Dara realized. Her voice could have cut glass.</p><p>"I am," he said gently. "Just not today. Today, I needed my children in the same room. It\'s been twelve years. I have things to say, and none of them fit in a telegram."</p><p>Kael laughed. Suki cried. Dara sat down on the porch steps and, for the first time in a decade, let herself be still.</p>' },
    ],
  },
  { title: 'Deep Currents', genre: 'Adventure', status: 'ongoing', writer: 0,
    description: 'A marine biologist and a treasure hunter form an uneasy alliance to explore a newly discovered underwater cave system in the Pacific.',
    cover: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&q=80',
    chapters: [
      { title: 'The Trench', content: '<p>Dr. Lena Vasquez had spent her career arguing that the ocean\'s greatest treasures were biological, not metallic. Gold was boring. A new species of bioluminescent coral was the kind of wealth that mattered.</p><p>Then the survey drone mapped C-117 — a cave system beneath the Mariana Ridge that shouldn\'t exist according to any geological model — and treasure hunter Jack Navarro showed up at her research station with a grin and a proposition.</p><p>"I\'ll fund the expedition," he said, tossing a folder of sonar images on her desk. "Three months, full crew, best equipment money can buy."</p><p>"And what do you get?"</p><p>"Whatever isn\'t alive." His grin widened. "Anything with a heartbeat is yours."</p>' },
      { title: 'Below the Light', content: '<p>The first dive took them 900 meters down, past the point where sunlight surrendered. The cave entrance was massive — a cathedral mouth in the cliff face, rimmed with organisms that glowed in patterns too regular to be random.</p><p>"That\'s not bioluminescence," Lena whispered into her comm. "That\'s communication."</p><p>Inside, the cave opened into chambers vast enough to dock a submarine. The walls pulsed with light. The water was warmer than it should have been, and from somewhere deep within, a current pushed outward — rhythmic, like breathing.</p><p>"This cave is alive," Lena said.</p><p>Jack checked his sonar. "Then let\'s see what it\'s been eating." He pointed the scanner deeper, and it returned an image that made them both go silent: a shape, enormous and symmetrical, resting at the bottom of the deepest chamber. Something built. Something waiting.</p>' },
    ],
  },

  // ── Drama ──
  { title: 'The Weight of Glass', genre: 'Drama', status: 'completed', writer: 2,
    description: 'A glassblower losing her sight must complete her masterwork before the darkness comes — confronting family wounds she\'s avoided for decades.',
    cover: 'https://images.unsplash.com/photo-1543946602-a0fef33180ab?w=400&q=80',
    chapters: [
      { title: 'Fractures', content: '<p>The diagnosis was macular degeneration. Progressive. Irreversible. Six months, maybe twelve, before the center of her vision dissolved into permanent fog.</p><p>Marguerite Solis had blown glass for forty years. Her hands knew the craft the way lungs know breathing — without thought, without effort, through pure accumulated memory.</p><p>"Your hands will still work," the doctor said gently.</p><p>"My hands follow my eyes," Marguerite replied. "Without sight, I make shapes. With it, I make art."</p><p>She drove home to her studio, fired the furnace, and began the piece she\'d been avoiding for twenty years — a life-sized glass tree, every leaf distinct, every branch a memory. Her masterwork. Her goodbye.</p>' },
      { title: 'The Apprentice', content: '<p>Her daughter showed up uninvited, as daughters do. Elena hadn\'t visited the studio in five years — not since the argument about "wasting talent on trinkets" that had really been about everything else: the missed recitals, the forgotten birthdays, the mother who loved her art more than her child.</p><p>"I heard about your eyes," Elena said from the doorway.</p><p>"News travels."</p><p>"Let me help."</p><p>Marguerite\'s hands paused on the molten glass. "You don\'t know glass."</p><p>"Then teach me. You have six months and a piece that needs finishing. I have two working eyes and nothing better to do."</p><p>It was a lie — Elena had a career, a life, things she was putting on hold. They both knew it. Neither mentioned it.</p>' },
      { title: 'Light Through Glass', content: '<p>The tree took four months. Four months of 5 AM starts, burnt fingers, and conversations that started about glass and ended about everything that had gone unsaid between them.</p><p>"I wasn\'t a good mother," Marguerite said one evening, shaping a leaf she could barely see.</p><p>"No," Elena agreed. "But you\'re a great artist. And I\'m learning that those things cost each other."</p><p>The finished piece stood seven feet tall. 3,000 individual glass leaves, each one catching light differently. When the morning sun hit it, the entire studio erupted in color — amber, emerald, ruby — light broken and rebuilt into something more beautiful than it had been before.</p><p>Marguerite couldn\'t see the details anymore. But she could see the light. And when Elena described what she saw — crying as she did — Marguerite realized that the masterwork wasn\'t the tree. It was the four months. It was the teaching, and the learning, and the long-overdue conversation about love.</p>' },
    ],
  },
  { title: 'Fourth Floor Walk-Up', genre: 'Drama', status: 'ongoing', writer: 1,
    description: 'Five tenants in a crumbling apartment building navigate gentrification, grief, and unexpected kindness in one pivotal summer.',
    cover: 'https://images.unsplash.com/photo-1460317442991-0ec209397118?w=400&q=80',
    chapters: [
      { title: 'June', content: '<p>The letter arrived on June 1st, identical for every unit: "Building sold. Renovation to commence August 15th. All current leases terminated."</p><p>Mrs. Park in 2B had lived there for 31 years. She read the letter, folded it precisely, and continued watering her window herbs as if nothing had happened.</p><p>Dante in 3A punched a wall. Then he taped the notice to the hole he\'d made and laughed — the desperate kind.</p><p>The Okafor twins in 4A sat on their fire escape and counted their savings on a phone calculator. It wasn\'t enough. It was never enough in this city.</p><p>Below them all, in 1A, retired judge Helen Cortez poured herself a bourbon and began drafting a legal challenge. She was eighty-two, arthritic, and the most dangerous person in the building.</p>' },
      { title: 'July', content: '<p>Judge Cortez\'s injunction bought them thirty days. Thirty days to prove the building had historical significance, or find another legal foothold, or simply figure out where five households would go in a city that had priced out everyone who made it worth living in.</p><p>Mrs. Park started cooking. Not for herself — for everyone. Korean stews appeared outside doors at 7 AM. Side dishes materialized on the communal table in the hallway. She didn\'t explain. She just cooked.</p><p>Dante fixed the elevator that hadn\'t worked in six years. It took him two weeks and parts salvaged from three different junkyards. On the day it hummed to life, everyone rode it to the roof, where the Okafor twins had set up mismatched lawn chairs and a borrowed speaker.</p><p>They sat together and watched the sunset paint the skyline gold. Nobody talked about August.</p>' },
    ],
  },

  // ── Comedy ──
  { title: 'The Worst Best Man', genre: 'Comedy', status: 'completed', writer: 1,
    description: 'A man who has been fired as best man from three weddings gets one last shot — at his ex-girlfriend\'s wedding to his boss.',
    cover: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80',
    chapters: [
      { title: 'The Ask', content: '<p>"You want me to be your best man," Derek repeated, certain he had misheard. "At your wedding. To Jessica. My ex-girlfriend Jessica. Who is also your employee Jessica. Who I see every day at work Jessica."</p><p>Ryan clapped him on the shoulder. "Who better? You know both of us!"</p><p>"That is literally the problem."</p><p>"Look, my brother\'s in Japan, my college roommate has a warrant in this state — which is a whole thing — and you\'re my best friend. Plus, Jess specifically requested you."</p><p>"She what?"</p><p>"She said, and I quote, \'Derek couldn\'t plan a birthday lunch without causing a small fire, and I want to watch him try.\'"</p><p>Derek stared at the ceiling. "I\'ll do it."</p>' },
      { title: 'The Bachelor Party', content: '<p>The bachelor party was supposed to be sophisticated. Derek had reserved a private dining room, hired a jazz trio, and prepared a PowerPoint about Ryan\'s life (tastefully edited).</p><p>What actually happened: the jazz trio cancelled (lead saxophone arrested — unrelated warrant), the private room double-booked with a retirement party for a woman named Gladys, and the PowerPoint corrupted into a slideshow of stock photos of disappointed businessmen.</p><p>By 10 PM, Derek, Ryan, and fourteen of Ryan\'s friends were doing karaoke with Gladys and her retired postal worker colleagues. Gladys turned out to have a four-octave range and a flask of something that could strip paint.</p><p>Ryan declared it "the best night of his life."</p><p>Derek added it to his list of beautiful disasters.</p>' },
      { title: 'The Toast', content: '<p>The wedding was perfect. The venue was perfect. Jessica was radiant. Ryan cried during the vows (three times). Derek held the rings without dropping them, which he considered a personal triumph.</p><p>Then came the toast.</p><p>Derek stood, unfolded his notes, looked at the 200 expectant faces, and put the notes away.</p><p>"I was the worst person to ask for this job," he said. "I have been fired as best man three times. Once for losing the rings in a lake. Once for accidentally setting a tent on fire. And once for reasons that remain legally sealed."</p><p>Laughter. Good laughter.</p><p>"But Ryan asked me because he believes in people — even when they don\'t deserve it. Even when they\'ve set things on fire. And Jessica asked me because she wanted proof that people can grow up." He raised his glass. "You two found each other, and you made everyone around you a little better. That\'s not a toast — that\'s a miracle. To Ryan and Jessica."</p><p>Jessica wiped her eyes. Ryan bear-hugged him hard enough to crack a rib. Gladys, in the back row, applauded loudest.</p>' },
    ],
  },
  { title: 'Reply All Apocalypse', genre: 'Comedy', status: 'ongoing', writer: 0,
    description: 'A single "Reply All" email at a Fortune 500 company spirals into corporate chaos, unlikely alliances, and the greatest office prank war in history.',
    cover: 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=400&q=80',
    chapters: [
      { title: 'The Email', content: '<p>It started, as all corporate disasters do, with a well-meaning email.</p><p>Janet from Accounting meant to forward a spreadsheet to her manager. Instead, she hit "Reply All" to a company-wide thread about the office holiday party. The spreadsheet contained everyone\'s salary.</p><p>All 12,000 employees.</p><p>By 9:03 AM, HR had received 847 complaints. By 9:15, someone in the Dubai office had created a ranking system. By 9:30, the CEO\'s assistant — who, it turned out, made more than the CFO — had been offered six external job interviews.</p><p>Janet locked herself in a supply closet and called her mother.</p><p>"Mom, I think I accidentally started a revolution."</p>' },
      { title: 'The Alliances', content: '<p>By Day Three, the company had fractured into factions. The "Underpaid and Aware" — mostly engineering — had started a Slack channel with 4,000 members. The "Overpaid and Nervous" — mostly middle management — had quietly removed their nameplates from their offices. Marketing declared neutrality and used the chaos to push through a rebrand they\'d been wanting for years.</p><p>Janet, still technically hiding, had become a folk hero. Someone had printed her face on t-shirts with the caption "JANET KNEW." She had not, in fact, known anything.</p><p>The CEO called an all-hands meeting. "This is a moment of radical transparency," he said, attempting to spin catastrophe into corporate values. "We will address all pay equity concerns."</p><p>From the back of the auditorium, someone yelled: "Starting with yours?"</p><p>The room erupted. Janet, watching the livestream from the supply closet, ate a granola bar and wondered if her LinkedIn was up to date.</p>' },
    ],
  },

  // ── General ──
  { title: 'Thirty-Seven Postcards', genre: 'General', status: 'completed', writer: 2,
    description: 'A retired postman walks his old route one last time, delivering letters he\'d been keeping in a shoebox for forty years.',
    cover: 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=400&q=80',
    chapters: [
      { title: 'The Shoebox', content: '<p>Albert Finney had carried mail for 42 years and kept a secret for 40 of them. In a shoebox under his bed were 37 pieces of mail — letters, postcards, a small package — that he had never delivered. Not out of malice. Out of mercy.</p><p>A Dear John letter to a man whose wife had just been diagnosed. A rejection from a dream school sent to a girl already on the edge. A postcard saying "I\'m not coming back" addressed to an elderly mother on Christmas Eve.</p><p>Albert had read each one (a federal offense, technically) and made a decision each time: not today. And "not today" had become "not ever."</p><p>Until now. Retirement made you take stock. And 37 undelivered truths felt heavier than 42 years of mail bags.</p>' },
      { title: 'The Route', content: '<p>He started at 6 AM, the way he always had. The street knew his footsteps — the cracks in the pavement, the dog at number 14 who still barked despite being nearly as old as Albert.</p><p>The first delivery was the easiest: a birthday card, 15 years late, to a woman who no longer lived at the address. He left it with the new tenant and a note: "This was meant for the previous owner. She would be 80 now."</p><p>The hardest was the love letter. Written in 1991 by a young man to his neighbor, confessing feelings he\'d never spoken aloud. The young man was now a grandfather. His neighbor had married someone else, moved to another city, and been widowed last spring.</p><p>Albert delivered the letter. The old man read it on his porch, cried quietly, and said: "I always wondered."</p>' },
      { title: 'The Last Stop', content: '<p>The 37th delivery was to himself. It was a postcard he had written to his late wife, during a fight they\'d had in 1996. He had stormed to the post office, scrawled five furious lines, and then — standing at the mailbox — pulled it back.</p><p><em>Dear Ruth — You were right. About everything. I am sorry I am too proud to say it to your face. I will try to be better. I will fail. But I will try.</em></p><p>Ruth had passed in 2019. Albert stood at her grave with the postcard and read it aloud. Then he placed it against the headstone, weighted with a small rock.</p><p>"Delivered," he said. "Better late than never."</p><p>He walked home along his old route for the last time, his mailbag empty, his shoebox empty, his heart — somehow — lighter than it had been in forty years.</p>' },
    ],
  },
  { title: 'The Listening Room', genre: 'General', status: 'ongoing', writer: 0,
    description: 'A woman opens a shop where you don\'t buy anything — you just sit and talk, and she listens. No advice. No judgment. Just listening.',
    cover: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80',
    chapters: [
      { title: 'Open', content: '<p>The shop had no sign. No name. Just a green door between a laundromat and a bakery, with a single word on the window: OPEN.</p><p>Mae had rented the space with her severance pay from the therapy practice she\'d left after fifteen years. She was done giving advice. Done diagnosing. Done writing prescriptions for problems that needed presence, not pills.</p><p>The room held two chairs, a small table, and a kettle. That was it.</p><p>Her first visitor was a man named Carl, who sat down and didn\'t speak for forty minutes. Then he said: "My son died." Then he cried. Then he thanked her and left.</p><p>He hadn\'t asked for advice. Mae hadn\'t given any. It was the most useful hour of work she\'d done in years.</p>' },
      { title: 'Regulars', content: '<p>Word spread the way real things spread — slowly, through whispers. The shop had no website, no social media, no Yelp page. People arrived because someone told them, and someone told them because it had helped.</p><p>Tuesdays belonged to Mrs. Okonkwo, who talked about her garden and, underneath the garden, about her husband\'s Alzheimer\'s. Thursdays were for Jason, age 19, who was trying to figure out how to tell his parents something important and needed to practice saying it to someone safe first.</p><p>Fridays were unpredictable. That was when strangers walked in. Some talked for five minutes. Some for three hours. One woman came in, sat in silence, finished her tea, and left a $100 bill under the cup with a note: "Thank you for the quiet."</p><p>Mae never turned anyone away. She never took notes. She never followed up. She simply listened, and in listening, she held things that people could not carry alone.</p>' },
    ],
  },
];

async function seed() {
  console.log('🌱 Seeding StoryVerse database...\n');

  try {
    // Hash a common password for all writers
    const passwordHash = await bcrypt.hash('Password123!', 10);

    // Insert writers
    const writerIds = [];
    for (const w of WRITERS) {
      const res = await db.query(
        `INSERT INTO users (username, email, password_hash, role, display_name, bio)
         VALUES ($1, $2, $3, 'writer', $4, $5)
         ON CONFLICT (email) DO UPDATE SET display_name = EXCLUDED.display_name
         RETURNING id`,
        [w.username, w.email, passwordHash, w.display_name, w.bio]
      );
      writerIds.push(res.rows[0].id);
      console.log(`  ✅ Writer: ${w.display_name}`);
    }

    // Insert stories and chapters
    let storyCount = 0;
    let chapterCount = 0;

    for (const s of STORIES) {
      const authorId = writerIds[s.writer];
      const storyRes = await db.query(
        `INSERT INTO stories (author_id, title, description, cover_image_url, genre, status, tags)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [authorId, s.title, s.description, s.cover, s.genre, s.status, [s.genre.toLowerCase()]]
      );
      const storyId = storyRes.rows[0].id;
      storyCount++;

      for (let i = 0; i < s.chapters.length; i++) {
        const ch = s.chapters[i];
        const plainText = ch.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        const wordCount = plainText ? plainText.split(' ').length : 0;

        await db.query(
          `INSERT INTO chapters (story_id, title, content, chapter_order, status, word_count)
           VALUES ($1, $2, $3, $4, 'published', $5)`,
          [storyId, ch.title, ch.content, i + 1, wordCount]
        );
        chapterCount++;
      }

      console.log(`  📖 ${s.genre.padEnd(10)} | ${s.status.padEnd(9)} | ${s.title} (${s.chapters.length} ch.)`);
    }

    console.log(`\n✨ Seeding complete!`);
    console.log(`   ${WRITERS.length} writers, ${storyCount} stories, ${chapterCount} chapters\n`);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    throw err;
  } finally {
    await db.pool.end();
  }
}

seed();
