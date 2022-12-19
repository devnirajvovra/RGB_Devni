import { FC } from 'react';
import styled from 'styled-components';
import { GameStatusEnum } from '../shared/enums'
import { IDnDProps, IDragDrop } from '../shared/interfaces'


const DragContainer = styled.div`
	display: inline-block;
	width: 26px;
	height: 26px;
	border-radius: 50%;
	border: 2px solid rgb(200, 200, 200);
	margin: 1px;
  	${(props: IDragDrop): string => {
    	return `
			background-color: rgb(
				${props.$color?.[0] || 0},
				${ props.$color?.[1] || 0},
				${props.$color?.[2] || 0}
			);
    	`;
	}};
	${(props: IDragDrop): string => {
    	return props.$clickable ? "cursor: pointer;" : "";
  	}}
`;

const DragDrop: FC<IDnDProps> = (props) => {
	const handleSourceClick = () => {
    	props.onSourceClick(props.cell.id);
  	};

	const handleDragOver = (e: DragEvent) => {
		e.preventDefault();
  	};

	const handleDrop = (e: DragEvent) => {
    	props.onCellDrop(e, props.cell.id);
  	};

  	let extraProps = {};
  	if (props.cell.isDnDEnabled) {
		extraProps = {
			onDragOver: handleDragOver,
			onDrop: handleDrop,
		};
  	}

	return (
    	<DragContainer
      	{...extraProps}
      	$color={props.cell.color}
      	$clickable={props.gameStatus === GameStatusEnum.INITIAL}
      	onClick={handleSourceClick}
    	/>
  	);
};

export default DragDrop;