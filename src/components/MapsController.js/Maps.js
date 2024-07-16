/* eslint-disable react/button-has-type */
import React, { useState, useEffect, useCallback } from 'react';
import ResultBox from './ResultBox';
import ModifierSelector from './ModifierSelector';
import './Maps.css';

const Maps = () => {
	const [wantedMods, setWantedMods] = useState([]);
	const [unwantedMods, setUnwantedMods] = useState([]);
	const [allModifiers, setAllModifiers] = useState([]);
	const [isT17Selected, setIsT17Selected] = useState(false);
	const [regex, setRegex] = useState('');
	const [error, setError] = useState('');
	const [warning, setWarning] = useState('');
	const [itemQuantity, setItemQuantity] = useState('');
	const [packSize, setPackSize] = useState('');
	const [allGoodMods, setAllGoodMods] = useState(false); 

	const fetchModifiers = useCallback(async () => {
		try {
			const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/maps?type=1`);

			if (!response.ok) {
				throw new Error('Network response was not ok');
			}

			const data = await response.json();

			return Object.keys(data).map(mod => ({ mod, isT17: false })) || [];
		} catch (error) {
			console.error('Failed to fetch modifiers:', error);
			return [];
		}
	}, []);

	const fetchT17Modifiers = useCallback(async () => {
		try {
			const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/maps/t17?type=2`);

			if (!response.ok) {
				throw new Error('Network response was not ok');
			}

			const data = await response.json();

			return Object.keys(data).map(mod => ({ mod, isT17: true })) || [];
		} catch (error) {
			console.error('Failed to fetch T17 modifiers:', error);
			return [];
		}
	}, []);

	useEffect(() => {
		const getInitialModifiers = async () => {
			const mods = await fetchModifiers();

			setAllModifiers(mods);
		};

		getInitialModifiers();
	}, [fetchModifiers]);

	const handleT17CheckboxChange = async checked => {
		setIsT17Selected(checked);

		if (checked) {
			const t17Mods = await fetchT17Modifiers();

			setAllModifiers(prevMods => {
				const combinedMods = [...t17Mods, ...prevMods];

				return combinedMods.filter((mod, index, self) =>
					index === self.findIndex(t => t.mod === mod.mod),
				);
			});
		} else {
			const regularMods = await fetchModifiers();

			setAllModifiers(regularMods);
		}
	};

	const handleModsChange = useCallback(async (newWantedMods, newUnwantedMods, newItemQuantity, newPackSize) => {
		try {
			const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/maps/generateMapRegex`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					wantedMods: newWantedMods,
					unwantedMods: newUnwantedMods,
					itemQuantity: newItemQuantity ? parseInt(newItemQuantity, 10) : undefined,
					packSize: newPackSize ? parseInt(newPackSize, 10) : undefined,
					allGoodMods: allGoodMods, 
				}),
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			const newRegex = data.regex;

			setRegex(newRegex);
		} catch (error) {
			console.error('生成正則表達式時出錯：', error);
			setError('生成正則表達式時發生錯誤');
		}
	}, [allGoodMods]);

	const handleReset = () => {
		setWantedMods([]);
		setUnwantedMods([]);
		setRegex('');
		setError('');
		setWarning('');
		setItemQuantity('');
		setPackSize('');
		setIsT17Selected(false);
		fetchModifiers().then(mods => setAllModifiers(mods));
	};

	const handleClearItemQuantity = React.useCallback(() => {
		setItemQuantity('');
		handleModsChange(wantedMods, unwantedMods, '', packSize);
	}, [wantedMods, unwantedMods, packSize, handleModsChange]);

	const handleClearPackSize = React.useCallback(() => {
		setPackSize('');
		handleModsChange(wantedMods, unwantedMods, itemQuantity, '');
	}, [wantedMods, unwantedMods, itemQuantity, handleModsChange]);

	return (
		<div className="maps-container">
			<div>
				<ResultBox
					result={regex}
					warning={warning}
					error={error}
					reset={handleReset}
					maxLength={50}
				/>
				<div className="quantity-inputs">
					<div className="item-quantity-input">
						<label htmlFor="itemQuantity">物品數量至少為：</label>
						<div className="input-with-clear">
							<input
								type="number"
								id="itemQuantity"
								value={itemQuantity}
								min="0"
								onChange={e => {
									setItemQuantity(e.target.value);
									handleModsChange(wantedMods, unwantedMods, e.target.value, packSize);
								}}
							/>
							{itemQuantity && (
								<button className="clear-button" onClick={handleClearItemQuantity}>
									x
								</button>
							)}
						</div>
					</div>
					<div className="pack-size-input">
						<label htmlFor="packSize">怪群大小至少為：</label>
						<div className="input-with-clear">
							<input
								type="number"
								id="packSize"
								value={packSize}
								min="0"
								onChange={e => {
									setPackSize(e.target.value);
									handleModsChange(wantedMods, unwantedMods, itemQuantity, e.target.value);
								}}
							/>
							{packSize && (
								<button className="clear-button" onClick={handleClearPackSize}>
									x
								</button>
							)}
						</div>
					</div>
					<label className="t17-checkbox">
						<input
							type="checkbox"
							checked={isT17Selected}
							onChange={e => handleT17CheckboxChange(e.target.checked)}
						/>
						<span>t17詞綴</span>
					</label>
					<div className="all-good-mods-toggle">
                        <button
                            onClick={() => setAllGoodMods(false)}
                            className={!allGoodMods ? 'active' : ''}
                        >
							任一詞即可
                        </button>
                        <button
                            onClick={() => setAllGoodMods(true)}
                            className={allGoodMods ? 'active' : ''}
                        >
							詞全對才亮
                        </button>
                    </div>
				</div>
				<div className="modifiers-container">
					<ModifierSelector
						title="不要的詞..."
						modifiers={allModifiers}
						selectedMods={unwantedMods}
						onSelectMod={mod => {
							const newUnwantedMods = [...unwantedMods, mod];

							setUnwantedMods(newUnwantedMods);
							handleModsChange(wantedMods, newUnwantedMods);
						}}
						onDeselectMod={mod => {
							const newUnwantedMods = unwantedMods.filter(m => m !== mod);

							setUnwantedMods(newUnwantedMods);
							handleModsChange(wantedMods, newUnwantedMods);
						}}
					/>
					<ModifierSelector
						title="需要的詞"
						modifiers={allModifiers}
						selectedMods={wantedMods}
						onSelectMod={mod => {
							const newWantedMods = [...wantedMods, mod];

							setWantedMods(newWantedMods);
							handleModsChange(newWantedMods, unwantedMods);
						}}
						onDeselectMod={mod => {
							const newWantedMods = wantedMods.filter(m => m !== mod);

							setWantedMods(newWantedMods);
							handleModsChange(newWantedMods, unwantedMods);
						}}
					/>

				</div>
			</div>
		</div>

	);
};

export default Maps;
