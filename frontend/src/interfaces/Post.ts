export interface Post {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  user: {
    id: string;
    username: string;
    fullname: string;
  };
}
