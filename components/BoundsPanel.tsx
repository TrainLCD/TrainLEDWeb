import { useAtomValue } from "jotai";
import { ChangeEvent, memo, useCallback } from "react";
import styled from "styled-components";
import { navigationAtom } from "../atoms/navigation";
import { trainTypeAtom } from "../atoms/trainType";
import useBounds from "../hooks/useBounds";
import useCurrentLine from "../hooks/useCurrentLine";
import useTrainTypeLabels from "../hooks/useTrainTypeLabels";
import { LineDirection } from "../models/bound";
import type { Station, TrainType } from "../models/grpc";
import {
  getIsMeijoLine,
  getIsOsakaLoopLine,
  getIsYamanoteLine,
} from "../utils/loopLine";
import Button from "./Button";
import { List, ListItem } from "./List";

const Container = styled.div``;
const Title = styled.h3`
  text-align: center;
`;

const BackButtonContainer = styled.div`
  margin-top: 24px;
  display: flex;
  justify-content: center;
`;

const TrainTypeInputContainer = styled.div`
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
`;

const TrainTypeSelect = styled.select`
  display: block;
  appearance: none;
  background-color: transparent;
  border: 1px solid #fff;
  color: white;
  font-size: 1rem;
  padding: 12px;
  outline: none;
  min-width: 240px;
  font-family: "JF-Dot-jiskan24";
  margin-top: 8px;
  text-align: center;
  max-width: 100%;

  :disabled {
    opacity: 0.5;
  }
`;

const ButtonInnerText = styled.span`
  font-weight: bold;
`;

type Props = {
  onSelect: (boundStation: Station, index: number) => void;
  onBack: () => void;
  onTrainTypeSelect: (trainType: TrainType) => void;
};

const BoundsPanel = ({ onSelect, onBack, onTrainTypeSelect }: Props) => {
  const { trainType, fetchedTrainTypes } = useAtomValue(trainTypeAtom);
  const { loading } = useAtomValue(navigationAtom);

  const currentLine = useCurrentLine();
  const trainTypeLabels = useTrainTypeLabels(fetchedTrainTypes);
  const { withTrainTypes, bounds } = useBounds();

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const newTrainType = fetchedTrainTypes.find(
        (tt) => Number(e.currentTarget.value) === tt.id
      );
      if (newTrainType) {
        onTrainTypeSelect(newTrainType);
      }
    },
    [fetchedTrainTypes, onTrainTypeSelect]
  );

  const getBoundTypeText = useCallback(
    (stations: Station[], direction: LineDirection) => {
      if (!currentLine) {
        return "";
      }
      const directionName = direction === "INBOUND" ? "右回り" : "左回り";
      if (getIsMeijoLine(currentLine.id)) {
        return `${directionName}(${stations
          .map((station) => station.name)
          .join("・")})`;
      }

      if (
        getIsYamanoteLine(currentLine.id) ||
        (getIsOsakaLoopLine(currentLine.id) && !trainType)
      ) {
        const directionName = direction === "INBOUND" ? "内回り" : "外回り";
        return `${directionName}(${stations
          .map((station) => station.name)
          .join("・")})`;
      }

      return `${stations.map((station) => station.name).join("・")}方面`;
    },
    [currentLine, trainType]
  );

  const renderBounds = useCallback(
    () =>
      bounds?.map(
        (group, index) =>
          group[0] && (
            <ListItem key={group[0]?.id}>
              <Button
                disabled={loading}
                onClick={() => onSelect(group[0], index)}
              >
                <ButtonInnerText>
                  {getBoundTypeText(group, !index ? "INBOUND" : "OUTBOUND")}
                </ButtonInnerText>
              </Button>
            </ListItem>
          )
      ),
    [bounds, getBoundTypeText, loading, onSelect]
  );

  return (
    <Container>
      <Title>行き先極度選択（しなさい）</Title>
      <List>{loading ? <p>Loading...</p> : renderBounds()}</List>
      {withTrainTypes ? (
        <TrainTypeInputContainer>
          <TrainTypeSelect value={trainType?.id ?? 0} onChange={handleChange}>
            {trainTypeLabels.map((label, idx) => (
              <option
                key={fetchedTrainTypes[idx]?.id}
                value={fetchedTrainTypes[idx]?.id}
              >
                {label}
              </option>
            ))}
          </TrainTypeSelect>
        </TrainTypeInputContainer>
      ) : (
        <TrainTypeInputContainer>
          <TrainTypeSelect
            disabled
            value={trainType?.id ?? 0}
            onChange={handleChange}
          >
            <option>
              {loading ? "読み込み中" : "選択可能な種別はありません"}
            </option>
          </TrainTypeSelect>
        </TrainTypeInputContainer>
      )}

      <BackButtonContainer>
        <Button onClick={onBack}>戻る</Button>
      </BackButtonContainer>
    </Container>
  );
};

export default memo(BoundsPanel);
