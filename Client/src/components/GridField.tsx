import { FC } from 'react';
import { IFieldProps } from '../shared/interfaces';
import Cell from './Cell';
import styled from 'styled-components';


const GridContainer = styled.div<{ columnNumber: number }>`
	margin: 0 20px;
	display: inline-grid;
	${(props): string => {
    	return `
      		grid-template-columns: repeat(${props.columnNumber}, 1fr);
    	`;
	}};
  	gap: 1px;
`;

const GridItem = styled.div`
	width: 28px;
	height: 28px;
`;

const GridField: FC<IFieldProps> = (props) => {
	return (
    	(typeof props.data.initial?.width !== 'undefined' && (
      		<GridContainer
				columnNumber={
					props.data.initial.width > 0 ? props.data.initial.width + 2 : 0
				}
      		>
        	{Array.isArray(props.field) &&
          		props.field.map((row) => {
            		return row.map((cell) => {
              			return (
                			<GridItem key = {cell.id}>
                  			<Cell
                    			cell = {cell}
                    			gameStatus = {props.data.game?.status}
                    			onSourceClick = {props.onSourceClick}
                    			onCellDrop = {props.onCellDrop}
							/>
                			</GridItem>
              			);
            		});
          		})}
      		</GridContainer>
		))
		|| null
  	);
};

export default GridField;