from app.schemas.feed import PostCreate, PostResponse, TagCreate
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.feeds import Post, Tag
from app.models.users import User
from sqlalchemy import select, func
from datetime import datetime
from app.llm.sementic_retriever import semantic_retriever
from app.llm.recommendation_engine import engine
from app.schemas.feed import UserMini


class PostController:
    async def create(self, data: PostCreate, user_id: str, db: AsyncSession):
        try:
            embedings = await semantic_retriever.embed_async(data.content)

            user = await db.get(User, user_id)

            if not user:
                raise HTTPException(status_code=404, detail='User not found!')
            
            new_post = Post(user_id=user_id, content=data.content, image_url=data.image_url, embedding=embedings)

            db.add(new_post)

            await db.flush()
            await db.refresh(new_post)
            await db.commit()

            post_response = PostResponse(
                id=new_post.id,
                content=new_post.content,
                image_url=new_post.image_url,
                created_at=new_post.created_at,
                user=UserMini(id=user.id, username=user.username, fullname=user.fullname)
            )

            return post_response
        
        except HTTPException:
            raise
        except Exception as e:
            print(e)
            raise HTTPException(status_code=500, detail='Internal server error!')
        
        
    async def list(self, user_id: str, db: AsyncSession, limit: int = 20):
        try:
            user = await db.get(User, user_id)

            if not user:
                raise HTTPException(status_code=404, detail="User not found!")

            tag_stmt = select(Tag).where(Tag.user_id == user_id)

            tag_result = await db.execute(tag_stmt)
            tags = list(tag_result.scalars().all())

            if not tags:
                post_stmt = (select(Post, User).join(User, User.id == Post.user_id).order_by(func.random())
                    .limit(limit)
                )

                post_result = await db.execute(post_stmt)
                rows = post_result.all()

                posts = [
                    {
                        "id": post.id,
                        "content": post.content,
                        "image_url": post.image_url,
                        "created_at": post.created_at,
                        "user": {
                            "id": post_user.id,
                            "username": post_user.username,
                            "fullname": post_user.fullname,
                        },
                    }
                    for post, post_user in rows
                ]

                return posts

            recommended = await engine.recommendations(
                user_id=user_id, tags=tags, db=db, limit=limit
            )

            return recommended

        except HTTPException:
            raise

        except Exception:
            raise HTTPException(status_code=500, detail="Internal server error!")


    async def auth_posts(self, user_id: str, db: AsyncSession, limit: int = 20):
        try:
            user = await db.get(User, user_id)

            if not user:
                raise HTTPException(status_code=404, detail="User not found!")

            post_stmt = (
                select(Post, User)
                .join(User, User.id == Post.user_id)
                .where(Post.user_id == user.id)
                .order_by(Post.created_at.desc())
                .limit(limit)
            )
            post_result = await db.execute(post_stmt)

            rows = post_result.all()

            posts = [
                {
                    "id": post.id,
                    "content": post.content,
                    "image_url": post.image_url,
                    "created_at": post.created_at,
                    "user": {
                        "id": post_user.id,
                        "username": post_user.username,
                        "fullname": post_user.fullname,
                    },
                }
                for post, post_user in rows
            ]

            return posts

        except HTTPException:
            raise

        except Exception:
            raise HTTPException(status_code=500, detail="Internal server error!")

    async def get(self, post_id: str, db: AsyncSession):
        try:
            post_stmt = (
                select(Post, User)
                .join(User, User.id == Post.user_id)
                .where(Post.id == post_id)
            )
            post_result = await db.execute(post_stmt)
            row = post_result.first()

            if not row:
                raise HTTPException(status_code=404, detail="Post not found!")

            post, post_user = row

            return {
                "id": post.id,
                "content": post.content,
                "image_url": post.image_url,
                "created_at": post.created_at,
                "user": {
                    "id": post_user.id,
                    "username": post_user.username,
                    "fullname": post_user.fullname,
                },
            }
        except HTTPException:
            raise
        except Exception:
            raise HTTPException(status_code=500, detail="Internal server error!")


post_controller = PostController()


class TagController:
    async def create(self, data: TagCreate, user_id: str, db: AsyncSession):
        try:
            embeddings = await semantic_retriever.embed_async(data.content)

            user = await db.get(User, user_id)

            if not user:
                raise HTTPException(status_code=404, detail='User not found!')
            
            new_tag = Tag(content=data.content, user_id=user_id, embedding=embeddings)

            db.add(new_tag)

            await db.flush()
            await db.refresh(new_tag)
            await db.commit()

            return new_tag
        
        except HTTPException:
            raise
        except Exception:
            raise HTTPException(status_code=500, detail='Internal server error!')
        
    
    async def list(self, user_id: str, db: AsyncSession):
        try:
            user = await db.get(User, user_id)

            if not user:
                raise HTTPException(status_code=404, detail='User not found!')
                
            statement = select(Tag.id, Tag.content).where(Tag.user_id==user_id)

            results = await db.execute(statement)
            tags = results.mappings().all()

            return {'data': tags}

        except HTTPException:
            raise
        except Exception:
            raise HTTPException(status_code=500, detail='Internal server error!')
        
    
    async def delete(self, user_id: str, tag_id: str, db: AsyncSession):
        try:
            user = await db.get(User, user_id)

            if not user:
                raise HTTPException(status_code=404, detail='User not found!')
            
            tag = await db.get(Tag, tag_id)

            if not tag:
                raise HTTPException(status_code=404, detail='Tag not found!')
            
            await db.delete(tag)
            await db.commit()

            return {'data': 'Tag deleted successfully!'}

        except HTTPException:
            raise
        except Exception:
            raise HTTPException(status_code=500, detail='Internal server error!')
    

tag_controller = TagController()