export type VideoDetails = {
  videoId: string;
  title: string;
  keywords?: string[];
  lengthSeconds: string;
  channelId: string;
  isOwnerViewing: boolean;
  shortDescription: string;
  isCrawlable: boolean;
  thumbnail: {
    thumbnails: {
      url: string;
      width: number;
      height: number;
    }[];
  };
  allowRatings: boolean;
  author: string;
  isPrivate: boolean;
  isUnpluggedCorpus: boolean;
};
