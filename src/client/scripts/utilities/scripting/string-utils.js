/******************************************************************************\
|                                                                              |
|                                 string-utils.js                              |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This contains minor general purpose string formatting utilities.      |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/

export function toTitleCase(string) {
	return string.replace(/\w\S*/g, function(txt) {
		return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
	});
}

export function capitalize(string) {
	return string.replace( /(^|\s)([a-z])/g , function(m,p1,p2) {
		return p1+p2.toUpperCase();
	});
}

export function truncatedTo(string, maxChars) {
	if (string.length > maxChars) {
		return string.slice(0, maxChars) + '...';
	} else {
		return string;
	}
}
