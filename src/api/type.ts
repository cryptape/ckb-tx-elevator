import type { ChainSnapshot } from "../db/type";

export enum SubMessageType {
    NewSnapshot = "newSnapshot",
}

export type SubMessageContent = ChainSnapshot | string;

export interface SubMessage {
    type: SubMessageType;
    content: SubMessageContent;
}
