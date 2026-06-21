import uuid
from app.llm.llm_connection import llm_connection
from app.schemas.llm import PostMini
import asyncio
from app.llm.sementic_retriever import semantic_retriever
from pgvector.sqlalchemy import Vector
from sqlalchemy import func
from collections import defaultdict
from app.models.feeds import Tag, Post
from sqlalchemy import select
from app.models.users import User

from sqlalchemy.ext.asyncio import AsyncSession


class RecommendationEngine:
    def __init__(self):
        pass


    async def recommendations(self, user_id: str, tags: list[Tag], db: AsyncSession, limit_per_tag: int = 50, limit: int = 20,
    ) -> list[dict]:
        if not tags:
            return []

        post_scores: dict[uuid.UUID, float] = defaultdict(float)
        post_data: dict[uuid.UUID, dict] = {}

        for tag in tags:
            if tag.embedding is None:
                continue

            distance = Post.embedding.cosine_distance(tag.embedding).label("distance")

            result = await db.execute(select(Post, User, distance).join(User, User.id == Post.user_id).where(Post.user_id != user_id)
                .order_by(distance)
                .limit(limit_per_tag)
            )
            rows = result.all()

            for post, user, dist in rows:
                similarity = 1 - dist

                if similarity > post_scores[post.id]:
                    post_scores[post.id] = similarity
                    post_data[post.id] = {
                        "id": post.id,
                        "content": post.content,
                        "image_url": post.image_url,
                        "created_at": post.created_at,
                        "user": {
                            "id": user.id,
                            "username": user.username,
                            "fullname": user.fullname,
                        },
                    }

        ranked = sorted(post_scores.items(), key=lambda kv: kv[1], reverse=True)

        return [post_data[post_id] for post_id, _ in ranked[:limit]]

   

engine = RecommendationEngine()