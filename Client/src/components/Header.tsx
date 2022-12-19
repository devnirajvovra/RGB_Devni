import { FC } from 'react';
import {DEFAULT_BORDER_COLOR } from '../shared/def-constants';
import {ICell, IGameUi } from '../shared/interfaces';
import { CellTypeEnum } from '../shared/enums'
import styled from 'styled-components';
import Tile from './Tile';

interface IToolTip {
	data: IGameUi;
	delta: number;
}

const Header = styled.div`
	margin: 20px;
`;

const InfoRow = styled.div`
	margin-bottom: 15px;
`;

const TargetRow = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	line-height: 20px;
	margin-bottom: 10px;
`;

const InfoBox: FC<IToolTip> = (props) => {
const targetCell: ICell = {
	id: "0",
	color: props.data.initial?.target || [0, 0, 0],
	borderColor: DEFAULT_BORDER_COLOR,
	type: CellTypeEnum.EMPTY,
	isDnDEnabled: false,
};

const closestCell: ICell = {
	id: "1",
	color: props.data.game?.closestColor || [0, 0, 0],
	borderColor: DEFAULT_BORDER_COLOR,
	type: CellTypeEnum.EMPTY,
	isDnDEnabled: false,
};

return (
	<Header>
		<InfoRow>
			<h1>RGB Alchemy</h1>
		</InfoRow>
		<InfoRow>User ID: {props.data.initial?.userId}</InfoRow>
		<InfoRow>
			Moves left:{" "}
			{(Number(props.data.initial?.maxMoves)) - ( Number(props.data.game?.stepCount))}
		</InfoRow>
		<TargetRow> Target color: &nbsp; <Tile cell={targetCell} /> </TargetRow>
		<TargetRow> Closest color: &nbsp; <Tile cell={closestCell} /></TargetRow>
		<TargetRow> Δ= {props.delta.toFixed(2)}%</TargetRow>
	</Header>
	);
};

export default InfoBox;