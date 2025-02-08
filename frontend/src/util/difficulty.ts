/**
 * https://github.com/nervosnetwork/ckb/blob/develop/util/types/src/utilities/difficulty.rs
 *
 * 将 compact 格式的 u32 十六进制字符串转换为 difficulty 数值 (bigint).
 *
 * compact 格式为一个 32 位数，其中：
 * - 最高 8 位为 exponent（以 256 为底），
 * - 低 24 位为 mantissa，
 * 并且 target = mantissa * 256^(exponent - 3)（当 exponent > 3 时为左移，否则右移）。
 *
 * difficulty 的计算规则为：
 * - 如果 target 等于 1，则 difficulty = 2^256 - 1；
 * - 否则 difficulty = 2^256 / target。
 *
 * 如果 compact 格式不合法（overflow 或 target 为 0）则返回 0n。
 *
 * @param compactHex - u32 的 compact 格式，格式如 "0x1d00ffff" 或 "0x20800000"
 * @returns difficulty 数值（bigint）
 */
const HSPACE: bigint = 1n << 256n;
const MAX_U256: bigint = (1n << 256n) - 1n;

export function compactToDifficulty(compactHex: string): bigint {
    // 将传入的十六进制字符串转换为 BigInt
    const compact: bigint = BigInt(compactHex);

    // 提取 exponent（最高 8 位）
    const exponent: number = Number(compact >> 24n);

    // 提取 mantissa（低 24 位）
    const mantissa: bigint = compact & 0x00ffffffn;

    // 根据 exponent 计算 target
    let target: bigint;
    if (exponent <= 3) {
        target = mantissa >> (8n * BigInt(3 - exponent));
    } else {
        target = mantissa << (8n * BigInt(exponent - 3));
    }

    // overflow 检查：如果 mantissa 非 0 且 exponent > 32，则视为 overflow，返回 0n
    if (mantissa !== 0n && exponent > 32) return 0n;
    if (target === 0n) return 0n;

    // 计算 difficulty：如果 target 为 1，则返回 MAX_U256，否则返回 HSPACE / target
    return target === 1n ? MAX_U256 : HSPACE / target;
}

export function difficultyToEH(value: bigint) {
    return +parseFloat(
        (+value.toString() / 1000000000000000000).toString(),
    ).toFixed(2);
}
