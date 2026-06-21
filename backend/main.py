import asyncio
import httpx

BASE_URL = "http://localhost:8000/api/posts/"
ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImE4ZWRmNzA2LTU2NDgtNDI0NC1iNjAwLTdmMGZhNTFjMDQ2NiIsInR5cGUiOiJhY2Nlc3MiLCJleHAiOjE3ODIwMjkzOTZ9.2rZgrHQ1jXJ_QJDjGzG4g_uVn_jkP2Kh_gWoJezvOQY"

if not ACCESS_TOKEN:
    raise RuntimeError("Set ACCESS_TOKEN environment variable before running")

SEMAPHORE = asyncio.Semaphore(5)

# 70 posts: diverse topics (tech, fitness, mental health, science, music, fashion, pets, etc.)
# Images: Unsplash source URLs (free, no auth needed, returns a real image)
POSTS = [
    # --- TECHNOLOGY & AI ---
    {
        "content": "AI is no longer the future — it's the present. The question is: are we ready for it? 🤖💡 #AI #Technology",
        "image_url": "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800"
    },
    {
        "content": "Your smartphone today is more powerful than the computers that sent humans to the moon. Let that sink in. 🚀📱 #Tech",
        "image_url": "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800"
    },
    {
        "content": "The next decade of the internet will look nothing like the last. Web3, AI, spatial computing — buckle up. 🌐⚡ #FutureTech",
        "image_url": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800"
    },
    {
        "content": "Every great app started as a messy idea on a napkin. Don't wait for perfect — ship it. 💻🔥 #Startups #Dev",
        "image_url": "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800"
    },
    {
        "content": "Clean code is not just about aesthetics — it's about respect for the next developer who reads it. 🧑‍💻❤️ #Coding",
        "image_url": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800"
    },

    # --- FITNESS & WELLNESS ---
    {
        "content": "Your body can handle almost anything. It's your mind you have to convince. 💪🧠 #Fitness #Mindset",
        "image_url": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800"
    },
    {
        "content": "One workout away from a good mood. That's it. That's the post. 🏋️‍♂️😊 #Gym #Wellness",
        "image_url": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800"
    },
    {
        "content": "Consistency > intensity. Show up every day, even when motivation is low. Results follow. 🔁💯 #FitnessMotivation",
        "image_url": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800"
    },
    {
        "content": "Rest days are not lazy days. Recovery is where the real growth happens. 🛌✨ #ActiveRecovery",
        "image_url": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800"
    },
    {
        "content": "Morning runs hit different when the world is still quiet and the sky is painted orange. 🌅🏃 #RunningCommunity",
        "image_url": "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800"
    },

    # --- MENTAL HEALTH ---
    {
        "content": "It's okay to not be okay. What matters is that you don't stay there alone. 💙🕊️ #MentalHealth",
        "image_url": "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800"
    },
    {
        "content": "Healing is not linear. Some days you'll feel great. Others won't. Both are part of the process. 🌱💚 #SelfCare",
        "image_url": "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800"
    },
    {
        "content": "Set boundaries — not walls. Protect your peace without closing your heart. 🧘‍♀️✨ #Boundaries #Mindfulness",
        "image_url": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800"
    },
    {
        "content": "Therapy is not a sign of weakness. It's one of the bravest things you can do for yourself. 💬❤️ #BreakTheStigma",
        "image_url": "https://images.unsplash.com/photo-1493836512294-502baa1986e2?w=800"
    },
    {
        "content": "Your mind deserves the same care as your body. Feed it well, rest it often, challenge it daily. 🧠🌿 #MindBodySoul",
        "image_url": "https://images.unsplash.com/photo-1528716321680-815a8cdb8cbe?w=800"
    },

    # --- SCIENCE & SPACE ---
    {
        "content": "We are made of stardust, living on a rock hurtling through space. Never forget how extraordinary that is. 🌌⭐ #Space",
        "image_url": "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800"
    },
    {
        "content": "The universe is under no obligation to make sense to us. That's exactly why science exists. 🔭🧪 #Science",
        "image_url": "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800"
    },
    {
        "content": "Mars is closer than ever. The generation that walks on another planet might already be alive today. 🔴🚀 #SpaceExploration",
        "image_url": "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=800"
    },
    {
        "content": "A black hole is so dense that not even light can escape it. The universe is metal. 🖤🌀 #Astrophysics",
        "image_url": "https://images.unsplash.com/photo-1614313913007-2b4ae8ce32d6?w=800"
    },
    {
        "content": "Science doesn't care about your opinion. That's what makes it beautiful. 📊🔬 #CriticalThinking",
        "image_url": "https://images.unsplash.com/photo-1532094349884-543559059f09?w=800"
    },

    # --- MUSIC ---
    {
        "content": "Music is the one language every human being understands without translation. 🎵🌍 #Music",
        "image_url": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800"
    },
    {
        "content": "A great song can take you back to a moment you forgot existed. That's pure magic. 🎶✨ #Nostalgia",
        "image_url": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800"
    },
    {
        "content": "Vinyl sounds better. Fight me. 🎛️🎸 #VinylRecords #AudiophileLife",
        "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800"
    },
    {
        "content": "Live music is a reminder that some experiences cannot be streamed. Be there in person. 🎤🔊 #LiveMusic",
        "image_url": "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800"
    },
    {
        "content": "Learning an instrument teaches you patience, discipline, and that failure is just practice in disguise. 🎹💪 #LearnMusic",
        "image_url": "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800"
    },

    # --- FASHION & STYLE ---
    {
        "content": "Style is not about wearing expensive things — it's about wearing yourself with confidence. 👗✨ #Fashion",
        "image_url": "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800"
    },
    {
        "content": "Sustainable fashion isn't a trend — it's the only responsible direction the industry can go. ♻️👚 #SlowFashion",
        "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"
    },
    {
        "content": "Dress for the life you want, not the life you have. Confidence is always in season. 💃🕶️ #OOTD",
        "image_url": "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800"
    },
    {
        "content": "Vintage finds, thrifted gems — the most unique wardrobe is the one nobody else has. 🛍️🌿 #ThriftStyle",
        "image_url": "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=800"
    },
    {
        "content": "Black is always in fashion. So is kindness. Wear both daily. 🖤🤝 #StyleTips",
        "image_url": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800"
    },

    # --- PETS & ANIMALS ---
    {
        "content": "Dogs don't care about your salary, your status, or your past. They just love you. 🐶❤️ #DogsOfInstagram",
        "image_url": "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800"
    },
    {
        "content": "Cats are just small, judgmental roommates who occasionally show affection. 10/10 would recommend. 🐱😂 #CatsOfInstagram",
        "image_url": "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800"
    },
    {
        "content": "Adopt, don't shop. There's a perfect pet waiting for you at a shelter right now. 🐾🏠 #AdoptDontShop",
        "image_url": "https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?w=800"
    },
    {
        "content": "Wildlife is not a backdrop — it's a world unto itself. Protect it fiercely. 🦁🌿 #WildlifeConservation",
        "image_url": "https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=800"
    },
    {
        "content": "The ocean holds creatures we haven't even discovered yet. Our planet is endlessly fascinating. 🐋🌊 #MarineLife",
        "image_url": "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=800"
    },

    # --- BOOKS & EDUCATION ---
    {
        "content": "A book is a door to a world that exists only when you open it. Read more. 📚🚪 #BookLovers",
        "image_url": "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800"
    },
    {
        "content": "The more you read, the more you realize how much you don't know. That's not humbling — it's exciting. 📖🧠 #LifelongLearning",
        "image_url": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800"
    },
    {
        "content": "Education doesn't end when school does. The real curriculum begins when you take charge of your own curiosity. 🎓✨ #Learning",
        "image_url": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800"
    },
    {
        "content": "Fiction builds empathy. Every character you inhabit teaches you what it's like to be someone else. 📝❤️ #Reading",
        "image_url": "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800"
    },
    {
        "content": "Libraries are the most democratic institutions on earth — free knowledge for anyone who walks through the door. 🏛️📚 #Libraries",
        "image_url": "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800"
    },

    # --- NATURE & ENVIRONMENT ---
    {
        "content": "Nature doesn't rush, yet everything gets done. Maybe we could learn something from that. 🌳🍃 #Nature",
        "image_url": "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800"
    },
    {
        "content": "The forests are the lungs of the earth. Every tree matters more than we realize. 🌲💚 #Environment",
        "image_url": "https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?w=800"
    },
    {
        "content": "Sunsets are proof that endings can be breathtakingly beautiful. 🌅🔥 #GoldenHour",
        "image_url": "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800"
    },
    {
        "content": "The ocean covers 71% of the earth, yet we've explored less than 20% of it. The deep blue is still full of mystery. 🌊🔵 #Ocean",
        "image_url": "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800"
    },
    {
        "content": "Climate action isn't a political choice — it's a survival choice. 🌍♻️ #ClimateChange #GoGreen",
        "image_url": "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800"
    },

    # --- ENTREPRENEURSHIP & MOTIVATION ---
    {
        "content": "Every successful business was once just a crazy idea someone refused to give up on. 💡🚀 #Entrepreneur",
        "image_url": "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800"
    },
    {
        "content": "Fail fast, learn faster. The only real failure is not trying at all. 💥📈 #StartupLife",
        "image_url": "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800"
    },
    {
        "content": "Your network is your net worth — but only if you actually add value to the people in it. 🤝💼 #Networking",
        "image_url": "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800"
    },
    {
        "content": "The 9-to-5 will make you a living. The 5-to-9 will make you a life. ⏰🔥 #Hustle #SideProject",
        "image_url": "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800"
    },
    {
        "content": "Stop waiting for the right moment. The right moment is the one you decide to act in. ⚡📅 #Motivation",
        "image_url": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800"
    },

    # --- ART & CREATIVITY ---
    {
        "content": "Art is not what you see — it's what you make others feel. 🎨🖼️ #Art #Creativity",
        "image_url": "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800"
    },
    {
        "content": "Creativity is intelligence having fun. Never stop making things. ✏️🌈 #CreateEveryDay",
        "image_url": "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800"
    },
    {
        "content": "Street art turns the city into a gallery. Every wall has a story if you stop to look. 🖌️🏙️ #StreetArt #UrbanArt",
        "image_url": "https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=800"
    },
    {
        "content": "Photography is the art of freezing time. One click, one moment, forever. 📷✨ #Photography",
        "image_url": "https://images.unsplash.com/photo-1452457807411-4979b707c5be?w=800"
    },
    {
        "content": "There are no mistakes in art — only happy accidents and new directions. 🎭🔄 #ArtProcess",
        "image_url": "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800"
    },

    # --- ARCHITECTURE & CITIES ---
    {
        "content": "Cities are living organisms — always growing, always changing, never sleeping. 🏙️🌆 #UrbanLife",
        "image_url": "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800"
    },
    {
        "content": "Good architecture doesn't just shelter — it inspires. The best buildings make you feel something. 🏛️✨ #Architecture",
        "image_url": "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800"
    },
    {
        "content": "Every city has a soul. Find it by getting lost in the streets most tourists never see. 🗺️🚶 #CityLife",
        "image_url": "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800"
    },

    # --- COFFEE & CAFÉ CULTURE ---
    {
        "content": "First coffee, then everything else. This is non-negotiable. ☕🔥 #CoffeeLover",
        "image_url": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800"
    },
    {
        "content": "A good café is not just about coffee — it's about the corner seat, the quiet hum, and the feeling of being perfectly alone together. ☕📖 #CaféLife",
        "image_url": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800"
    },
    {
        "content": "Espresso is not a drink. It's a ritual. ☕⚡ #Espresso #CoffeeTime",
        "image_url": "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=800"
    },

    # --- RELATIONSHIPS & PEOPLE ---
    {
        "content": "Surround yourself with people who make you better — not just comfortable. 👥💛 #GrowTogether",
        "image_url": "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800"
    },
    {
        "content": "The best conversations happen when phones are face-down and eyes are wide open. 🙌💬 #RealConnection",
        "image_url": "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800"
    },
    {
        "content": "Kindness costs nothing and means everything. Be generous with it. 🤍✨ #BeKind",
        "image_url": "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800"
    },
    {
        "content": "Loneliness and solitude are different things. One depletes you. The other restores you. Know which you need. 🌿🧘 #Introspection",
        "image_url": "https://images.unsplash.com/photo-1474631245212-32dc3c8310c6?w=800"
    },

    # --- NIGHT SKY & ASTRONOMY ---
    {
        "content": "On a clear night, far from city lights, the sky reminds you how small — and how lucky — you are. 🌠🔭 #Stargazing",
        "image_url": "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800"
    },
    {
        "content": "The Milky Way has been above us every night of human history. Most of us have never seen it. Find dark skies. 🌌✨ #MilkyWay #Astronomy",
        "image_url": "https://images.unsplash.com/photo-1436891620584-47fd0e565afb?w=800"
    },
]


async def create_post(client: httpx.AsyncClient, post: dict):
    async with SEMAPHORE:
        payload = {
            "content": post["content"],
            "image_url": post["image_url"],
        }
        try:
            response = await client.post(BASE_URL, json=payload)
            response.raise_for_status()
            print(f"✅ created: {post['content'][:60]!r}...")
        except httpx.HTTPStatusError as e:
            print(f"❌ failed: {post['content'][:60]!r}... → {e.response.status_code} {e.response.text}")
        except httpx.RequestError as e:
            print(f"❌ request error for {post['content'][:60]!r}... → {type(e).__name__}: {e}")


async def main():
    headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
    async with httpx.AsyncClient(timeout=30.0, headers=headers) as client:
        tasks = [create_post(client, post) for post in POSTS]
        await asyncio.gather(*tasks)
        print(f"\n🎉 Done! Attempted {len(POSTS)} posts.")


if __name__ == "__main__":
    asyncio.run(main())