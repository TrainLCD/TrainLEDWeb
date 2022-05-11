import type { Line, Station } from "../models/StationAPI";

export const isYamanoteLine = (lineId: number | undefined): boolean =>
  lineId === 11302;

const isOsakaLoopLine = (lineId: number): boolean => lineId === 11623;

export const getIsLoopLine = (line: Line | undefined): boolean => {
  if (!line) {
    return false;
  }
  return isYamanoteLine(line.id) || isOsakaLoopLine(line.id);
};

const yamanoteLineDetectDirection = (
  loopIndexStation: Station,
  currentStation: Station
): string => {
  if (!currentStation) {
    return "";
  }
  if (loopIndexStation.groupId === currentStation.groupId) {
    return "";
  }

  return loopIndexStation.name;
};

const osakaLoopLineDetectDirection = (
  loopIndexStation: Station,
  currentStation: Station
): string => {
  if (!currentStation) {
    return "";
  }
  if (loopIndexStation.groupId === currentStation.groupId) {
    return "";
  }
  return loopIndexStation.name;
};

export const inboundStationForLoopLine = (
  stations: Station[],
  index: number,
  selectedLine: Line | undefined
): { boundFor: string; station: Station } | null => {
  if (!selectedLine) {
    return null;
  }
  const nextStations = stations.slice().reverse();
  const foundStations = nextStations
    .map((s) => ({
      station: s,
      boundFor: isYamanoteLine(selectedLine.id)
        ? yamanoteLineDetectDirection(s, stations[index])
        : osakaLoopLineDetectDirection(s, stations[index]),
    }))
    .filter((s) => s.boundFor);
  // 配列の中に主要駅がない場合後ろに配列を連結して走査する
  const foundStation: { boundFor: string; station: Station } | undefined =
    foundStations[0];
  if (!foundStation) {
    const joinedStations = [...nextStations, ...stations];
    const newNextStations = index
      ? joinedStations.slice(
          joinedStations.length - index,
          joinedStations.length
        )
      : joinedStations.slice().reverse().slice(1); // 大崎にいた場合品川方面になってしまうため
    const newFoundStations = newNextStations
      .map((s) => ({
        station: s,
        boundFor: isYamanoteLine(selectedLine.id)
          ? yamanoteLineDetectDirection(s, stations[index])
          : osakaLoopLineDetectDirection(s, stations[index]),
      }))
      .filter((s) => s.boundFor);
    return newFoundStations[0];
  }
  return foundStation;
};

export const outboundStationForLoopLine = (
  stations: Station[],
  index: number,
  selectedLine: Line | undefined
): { boundFor: string; station: Station } | null => {
  if (!selectedLine) {
    return null;
  }
  const nextStations = index
    ? stations.slice().slice(index)
    : stations.slice(index);
  const foundStations = nextStations
    .map((s) => ({
      station: s,
      boundFor: isYamanoteLine(selectedLine.id)
        ? yamanoteLineDetectDirection(s, stations[index])
        : osakaLoopLineDetectDirection(s, stations[index]),
    }))
    .filter((s) => s.boundFor);
  // 配列の中に主要駅がない場合後ろに配列を連結して走査する
  const foundStation: { boundFor: string; station: Station } | undefined =
    foundStations[0];
  if (!foundStation) {
    const afterStations = isYamanoteLine(selectedLine.id)
      ? stations.slice().reverse()
      : stations.slice();
    const joinedStations = [...nextStations, ...afterStations];
    const newNextStations = index
      ? joinedStations
          .slice()
          .reverse()
          .slice(joinedStations.length - index, joinedStations.length)
      : joinedStations.slice().reverse().slice(1); // 大崎にいた場合品川方面になってしまうため
    const newFoundStations = newNextStations
      .map((s) => ({
        station: s,
        boundFor: isYamanoteLine(selectedLine.id)
          ? yamanoteLineDetectDirection(s, stations[index])
          : osakaLoopLineDetectDirection(s, stations[index]),
      }))
      .filter((s) => s.boundFor);
    return newFoundStations[0];
  }
  return foundStation;
};