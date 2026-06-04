export class OnchurchCommunityPostWriteCommand {
  category: string | null;
  title: string;
  content: string | null;
  photoUrls: string[];
  videoUrl: string | null;

  constructor(params: {
    category: string | null;
    title: string;
    content: string | null;
    photoUrls: string[];
    videoUrl: string | null;
  }) {
    this.category = params.category;
    this.title = params.title;
    this.content = params.content;
    this.photoUrls = params.photoUrls;
    this.videoUrl = params.videoUrl;
  }
}
