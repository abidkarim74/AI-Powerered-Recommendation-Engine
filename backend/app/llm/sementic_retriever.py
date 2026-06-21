from sentence_transformers import SentenceTransformer
import numpy as np
from pathlib import Path
from sklearn.metrics.pairwise import cosine_similarity
import time
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.feeds import Post
from sqlalchemy import select


BASE_DIR = Path(__file__).resolve().parents[2]
model_path = BASE_DIR / "llm_models" / "bge-base-en-v1.5"


class SemanticRetriever:
    def __init__(self):
        self.model = SentenceTransformer(str(model_path))

    def embed(self, texts: list[str]) -> np.ndarray:
        start = time.perf_counter()
        embeddings = self.model.encode(texts, normalize_embeddings=True)
        print(f"Encode time: {time.perf_counter() - start:.6f}s")
        return embeddings

    async def embed_async(self, texts: list[str]) -> np.ndarray:
        return await asyncio.to_thread(self.embed, texts)

    def deduplicate_tags(self, user_tags: list[str], similarity_threshold: float = 0.85) -> list[str]:
        if not user_tags:
            return []

        embeddings = self.embed(user_tags)
        sim_matrix = cosine_similarity(embeddings)

        kept = []
        kept_indices = []

        for i, tag in enumerate(user_tags):
            too_similar = any(
                sim_matrix[i][j] >= similarity_threshold
                for j in kept_indices
            )
            if not too_similar:
                kept.append(tag)
                kept_indices.append(i)

        print(f"Tags: {len(user_tags)} → {len(kept)} after dedup")
        for tag in kept:
            print(f"  kept: {tag}")

        return kept

    def retrieve_candidates(self, user_tags: list[str], posts: list[Post], top_k: int = 5) -> list[dict]:
        if not posts:
            return []

        tag_embeddings = self.embed(user_tags)
        post_embeddings = np.array([post["embedding"] for post in posts])

        score_matrix = post_embeddings @ tag_embeddings.T
        scores = score_matrix.max(axis=1)
        top_indices = np.argsort(scores)[::-1][:top_k]

        return [
            {
                "id": posts[i]["id"],
                "content": posts[i]["content"],
                "embedding_score": float(scores[i]),
                "best_tag": user_tags[int(score_matrix[i].argmax())],
            }
            for i in top_indices
        ]

    async def retrieve_candidates_async(self, user_tags: list[str], posts: list[dict], top_k: int = 20) -> list[dict]:
        return await asyncio.to_thread(
            self.retrieve_candidates, user_tags, posts, top_k
        )
    


semantic_retriever = SemanticRetriever()
