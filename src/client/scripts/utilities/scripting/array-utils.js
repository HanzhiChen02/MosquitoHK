/******************************************************************************\
|                                                                              |
|                                  array-utils.js                              |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This contains some general purpose array handling utilities.          |
|                                                                              |
|        Author(s): Abe Megahed                                                |
|                                                                              |
|        This file is subject to the terms and conditions defined in           |
|        'LICENSE.txt', which is part of this source code distribution.        |
|                                                                              |
|******************************************************************************|
|     Copyright (C) 2025, Data Science Institute, University of Wisconsin      |
\******************************************************************************/

export function clone(array) {
	return array.slice(0);
}

export function remove(array, item) {
	let index = array.indexOf(item);
	if (index !== -1) {
		array.splice(index, 1);
	}
	return array;
}

export function removeAll(array, items) {
	let result = clone(array);
	for (let i = 0; i < items.length; i++) {
		result = remove(result, items[i]);
	}
	return result;
}
