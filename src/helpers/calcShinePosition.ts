interface Args {
  leftRight: number;
  frontBack: number;
  limitX: number;
  minY: number;
  maxY: number;
}

export default ({ leftRight, frontBack, limitX, minY, maxY }: Args) => {
  const isLeft = leftRight > 0;
  const bothSidesDec = Math.min(Math.abs(leftRight) / limitX, 1);
  const decFromLeft = isLeft ? 0.5 - bothSidesDec / 2 : 0.5 + bothSidesDec / 2;
  const percentFromLeft = decFromLeft * 100;

  const dist = maxY - minY;
  const distFromMin = Math.min(Math.max(frontBack - minY, 0), dist);
  const distFromTop = dist - distFromMin;
  const percentFromTop = (distFromTop / dist) * 100;

  return { percentFromLeft, percentFromTop };
};
