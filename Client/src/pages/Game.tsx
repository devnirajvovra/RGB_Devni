import { FC, useEffect, useState } from 'react';
import axios from 'axios';
import ReactTooltip from'react-tooltip';
import Header from '../components/Header';
import GridField from '../components/GridField';
import {
	NEAREST_COLOR_BORDER,
	DEFAULT_BORDER_COLOR,
	CELL_ID_WITH_NEAREST_COLOR,
	DEFAULT_DELTA,
	DELTA_WIN_CONDITION,
	INITIAL_STEPS_NUMBER,
	INIT_URL,
} from '../shared/def-constants';
import {
	IResponseData,  
	ICell,
	IGameUi,
	IGameState
} from '../shared/interfaces'
import {
	generateInitialField,
	getCellColor,
	getFieldCopy,
	updatedBoardTilesByLine,
	getCellX,
	getCellY,
} from '../helpers';
import { CellTypeEnum, GameStatusEnum } from '../shared/enums'

const Game: FC = () => {
	const [data, setData] = useState<IGameUi>({});
	const [field, setField] = useState<ICell[][]>([]);
	const [delta, setDelta] = useState<number>(DEFAULT_DELTA);
	const [cellIdWithClosestColor, setCellIdWithClosestColor] = useState(CELL_ID_WITH_NEAREST_COLOR);

	useEffect(() => {
		initGame();
	}, []);

	useEffect(() => {
		setClosestColorAndDelta();
		ReactTooltip.rebuild();
	}, [field]);

	useEffect(() => {
		resetCellBorders();
		setClosestColorCellBorder(cellIdWithClosestColor);
	}, [cellIdWithClosestColor]);

	useEffect(() => {
		checkWinConditions();
	}, [delta]);

  	const checkFinishConditions = (stepCount: number) => {
    	if (Number(data.initial?.maxMoves) - stepCount === 0) {
      		setData((prevState) => ({
				...prevState,
				game: {
					...(prevState.game as IGameState),
					status: GameStatusEnum.FINISHED,
       			},
      		}));

			if (window.confirm('Failed. Do you want to try again?')) {
				restart();
			}
    	}
  	};

	const checkWinConditions = () => {
		if (delta < DELTA_WIN_CONDITION) {
			setData((prevState) => ({
				...prevState,
				game: {
					...(prevState.game as IGameState),
					status: GameStatusEnum.FINISHED,
				},
			}));

			if (window.confirm('Victory. Do you want to play again?')) {
				restart();
			}
		}
  	};

	const restart = () => {
		initGame(data.initial?.userId);
	};

  	const setClosestColorAndDelta = () => {
		const { minimalDelta, closestColor } = getClosestColorAndDelta();

		setData((prevState) => ({
			...prevState,
			game: {
				...(prevState.game as IGameState),
				closestColor,
			},
		}));

		setDelta(minimalDelta);
	};

	const resetCellBorders = () => {
		setField((prevState) => {
			const updatedField = getFieldCopy(prevState);

			for (let y = 1; y <= Number(data.initial?.height); y++) {
				for (let x = 1; x <= Number(data.initial?.width); x++) {
				updatedField[y][x] = {
					...updatedField[y][x],
					borderColor: DEFAULT_BORDER_COLOR,
				};
				}
			}

			return updatedField;
		});
  	};

  	const setClosestColorCellBorder = (cellId: string) => {
		setField((prevState) => {
			const x = getCellX(cellId);
			const y = getCellY(cellId);
			const updatedField = getFieldCopy(prevState);

			if (typeof updatedField[y]?.[x] !== "undefined") {
				updatedField[y][x] = {
				...updatedField[y][x],
				borderColor: NEAREST_COLOR_BORDER,
				};
			}

			return updatedField;
		});
  	};

	const getClosestColorAndDelta = () => {
		let minimalDelta = DEFAULT_DELTA;
		let closestColor = [0, 0, 0];
		const targetColor = data.initial?.target as number[];
		let cellColor;
		let currentDelta;

		for (let y = 1; y <= Number(data.initial?.height); y++) {
			for (let x = 1; x <= Number(data.initial?.width); x++) {
				cellColor = field[y][x].color;

				//Skips uncolored cells
				if (cellColor[0] === 0 && cellColor[1] === 0 && cellColor[2] === 0) {
					continue;
				}

        		currentDelta =
					(1 / 255 / Math.sqrt(3))
					* Math.sqrt(
						Math.pow(targetColor[0] - cellColor[0], 2)
						+ Math.pow(targetColor[1] - cellColor[1], 2)
						+ Math.pow(targetColor[2] - cellColor[2], 2)
					)
					* 100;
				if (currentDelta < minimalDelta) {
					setCellIdWithClosestColor(x + ',' + y);

					minimalDelta = currentDelta;
					closestColor = cellColor;
				}
      		}
    	}

    	return { minimalDelta, closestColor };
	};

 	const initGame = (userId?: string) => {
		let url = INIT_URL;
		if (userId) {
			url = INIT_URL + '/user/' + userId;
		}

		axios.get<IResponseData>(url).then(({ data }) => {
			setInitialGame(data);
			setInitialField(data);
			setClosestColorCellBorder(CELL_ID_WITH_NEAREST_COLOR);
		});
  	};

  	const setInitialGame = (initialData: IResponseData) => {
		setData((prevState) => ({
			...prevState,
			initial: initialData,
			game: {
				closestColor: [0, 0, 0],
				status: GameStatusEnum.INITIAL,
				stepCount: 0,
				nextColor: [255, 0, 0], //  red color paints 1st Source
				isDnDEnabled: false,
			},
    	}));
  	};

	const setInitialField = (data: IResponseData) => {
		setField(generateInitialField(data));
	};

	const handleSourceClick = (cellId: string) => {
		if (data.game?.status == GameStatusEnum.INITIAL) {
			initialGameProc(cellId);
		}
	};

  	const handleCellDrop = (event: DragEvent, sourceCellId: string) => {
		const tileCellId = event.dataTransfer?.getData('id') as string;

		if (data.game?.status == GameStatusEnum.RUNNING) {
			draggingGameProc(tileCellId, sourceCellId);
		}
	};

  	const toggleDnD = (isDnDEnabled: boolean) => {
		setField((prevState) => {
			const updatedField = getFieldCopy(prevState);

			for (let y = 0; y <= Number(data.initial?.height) + 1; y++) {
				for (let x = 0; x <= Number(data.initial?.width) + 1; x++) {
					if (updatedField[y][x].type !== CellTypeEnum.EMPTY) {
						updatedField[y][x] = {
							...updatedField[y][x],
							isDnDEnabled: isDnDEnabled,
						};
					}
				}
			}

			return updatedField;
    	});
	};

	/**
	 * Sets a color for next step, painting
	 * the next source when it is clicked.
	 * Checks when the state of the game needs to change
	 *
	 * @param cellId id of the cell is handled
	 */
  	const initialGameProc = (cellId: string) => {
		if (typeof data.game?.stepCount !== 'undefined') {
			const stepCount = data.game.stepCount;

			paintSourceAndTilesLine(cellId, data.game?.nextColor);

			switch (stepCount) {
				case 0:
					setData(
						(prevState): IGameUi => ({
							...prevState,
							game: {
								...(prevState.game as IGameState),
								nextColor: [0, 255, 0],
							},
						})
					);
				break;
				case 2:
				default:
					setData(
						(prevState): IGameUi => ({
							...prevState,
							game: {
								...(prevState.game as IGameState),
								nextColor: [0, 0, 255]
							},
						})
					);
			}

			if (stepCount === INITIAL_STEPS_NUMBER - 1) {
				setData((prevState) => ({
					...prevState,
					game: {
						...(prevState.game as IGameState),
						status: GameStatusEnum.RUNNING,
					},
				}));

				toggleDnD(true);
			}

			increaseStepCount(stepCount);
    	}
  	};

  	const increaseStepCount = (stepCount: number) => {
		setData((prevState) => ({
			...prevState,
			game: {
				...(prevState.game as IGameState),
				stepCount: stepCount + 1,
			},
		}));
  	};

 	const paintSourceAndTilesLine = (cellId: string, cellColor: number[]) => {
		setField((prevState) => {
			const x = getCellX(cellId);
			const y = getCellY(cellId);
			const updatedField = getFieldCopy(prevState);

			updatedField[y][x] = {
				...updatedField[y][x],
				color: cellColor,
			};

			return updatedBoardTilesByLine(data, cellId, updatedField);
		});
  	};

  	const draggingGameProc = (tileCellId: string, sourceCellId: string) => {
		if (typeof data.game?.stepCount !== 'undefined') {
			const stepCount = data.game.stepCount;
			const tileColor = getCellColor(field, tileCellId);

			paintSourceAndTilesLine(sourceCellId, tileColor);

			increaseStepCount(stepCount);

			checkFinishConditions(stepCount + 1);
		}
  	};

  	return (
		<>
		<Header data ={data} delta={delta} />
			<GridField
				data={data}
				field={field}
				onSourceClick={handleSourceClick}
				onCellDrop={handleCellDrop}
			/>
			<ReactTooltip
				backgroundColor="#858585"
				textColor="#fff"
				place="bottom"
				type="light"
				effect="solid"
			/>
		</>
  	);
};

export default Game;