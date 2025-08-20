export interface Input {
    influencerDescription: string;
    usernames: string[];
    mock?: boolean;
    generatedKeywords: number;
    profilesPerKeyword: number;
}

export type Influencer = {
    url: string;
}

/** This is not the full response from TikTok, just the data we want to sand to the AI to evaluate */
export type TikTokDatasetItem = {
    authorMeta: AuthorMeta,
    input: string,
} & VideoInformation

export type ProfileInformation = {
    authorMeta: AuthorMeta,
    videos: Omit<VideoInformation, 'videoMeta'>[]
}

type AuthorMeta = {
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
}

type VideoInformation = {
    videoMeta: Record<string, unknown>,
    diggCount: number,
    shareCount: number,
    playCount: number,
    collectCount: number,
    commentCount: number,
    text: string,
}
