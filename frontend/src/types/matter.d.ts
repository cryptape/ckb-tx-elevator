// src/types/matter.d.ts
import "matter-js";

declare module "matter-js" {
    interface BodyToolTip {
        txHash: string;
        txSize: number;
        txType: number;
        txFee: number;
        FirstSeenInPool?: number;
    }
    interface Body {
        tooltip?: BodyToolTip; // 声明自定义属性
    }

    interface IBodyDefinition {
        tooltip?: BodyToolTip; // 允许在创建 Body 时传入 tooltip
    }
}
