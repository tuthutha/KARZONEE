export const formatVND = (value, withSuffix = false) => {
  const num = Number(value) || 0;
  const formatted = num.toLocaleString('vi-VN');
  return withSuffix ? `${formatted}₫/ngày` : `${formatted}₫`;
};
