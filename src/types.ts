export type Influencer = {
    url: string;
}

/** This is not the full response from TikTok, just the data we want to sand to the AI to evaluate */
export type TikTokDatasetItem = {
    authorMeta: {
      id: string,
      name: string,
      profileUrl: string,
      nickName: string,
      verified: false,
      signature: string,
      bioLink: string | null,
      commerceUserInfo: {
        commerceUser: boolean
      },
      privateAccount: boolean,
      region: string,
      roomId: string,
      ttSeller: boolean,
      following: number,
      friends: number,
      fans: number,
      heart: number,
      video: number,
      digg: number
    },
    videoMeta: {
        title: string
    },
    diggCount: number,
    shareCount: number,
    playCount: number,
    collectCount: number,
    commentCount: number,
    input: string,
}

export type StructuredProfileInformation = {
  originalUserInput: string,
  authorInformation: TikTokDatasetItem['authorMeta'],
  videosInformation: {
    title: string
    diggCount: number,
    shareCount: number,
    playCount: number,
    collectCount: number,
    commentCount: number,
  }[],
}
