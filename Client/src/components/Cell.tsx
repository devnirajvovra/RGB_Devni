import { CellTypeEnum } from '../shared/enums'
import { FC } from 'react';
import { ICellProps } from '../shared/interfaces';
import DragDrop from './DragDrop';
import styled from 'styled-components';
import Tile from './Tile';


const Empty = styled.div`
	display: inline-block;
	width: 28px;
	height: 28px;
	background-color: transparent;
`;

const Cell: FC<ICellProps> = (props) => {
	switch (props.cell.type) {

		case CellTypeEnum.TILE:
			return <Tile cell={props.cell} />;

		case CellTypeEnum.SOURCE:
			return (
				<DragDrop
					cell={props.cell}
					gameStatus={props.gameStatus}
					onSourceClick={props.onSourceClick}
					onCellDrop={props.onCellDrop}
				/>
			);

		default:
			return <Empty />;
	}
};

export default Cell;
