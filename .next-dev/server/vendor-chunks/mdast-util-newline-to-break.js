"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/mdast-util-newline-to-break";
exports.ids = ["vendor-chunks/mdast-util-newline-to-break"];
exports.modules = {

/***/ "(ssr)/./node_modules/mdast-util-newline-to-break/lib/index.js":
/*!***************************************************************!*\
  !*** ./node_modules/mdast-util-newline-to-break/lib/index.js ***!
  \***************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   newlineToBreak: () => (/* binding */ newlineToBreak)\n/* harmony export */ });\n/* harmony import */ var mdast_util_find_and_replace__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mdast-util-find-and-replace */ \"(ssr)/./node_modules/mdast-util-find-and-replace/lib/index.js\");\n/**\n * @typedef {import('mdast').Content} Content\n * @typedef {import('mdast').Root} Root\n * @typedef {import('mdast-util-find-and-replace').ReplaceFunction} ReplaceFunction\n */\n\n/**\n * @typedef {Content | Root} Node\n */\n\n\n\n/**\n * Turn normal line endings into hard breaks.\n *\n * @param {Node} tree\n *   Tree to change.\n * @returns {void}\n *   Nothing.\n */\nfunction newlineToBreak(tree) {\n  (0,mdast_util_find_and_replace__WEBPACK_IMPORTED_MODULE_0__.findAndReplace)(tree, /\\r?\\n|\\r/g, replace)\n}\n\n/**\n * Replace line endings.\n *\n * @type {ReplaceFunction}\n */\nfunction replace() {\n  return {type: 'break'}\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvbWRhc3QtdXRpbC1uZXdsaW5lLXRvLWJyZWFrL2xpYi9pbmRleC5qcyIsIm1hcHBpbmdzIjoiOzs7OztBQUFBO0FBQ0EsYUFBYSx5QkFBeUI7QUFDdEMsYUFBYSxzQkFBc0I7QUFDbkMsYUFBYSx1REFBdUQ7QUFDcEU7O0FBRUE7QUFDQSxhQUFhLGdCQUFnQjtBQUM3Qjs7QUFFMEQ7O0FBRTFEO0FBQ0E7QUFDQTtBQUNBLFdBQVcsTUFBTTtBQUNqQjtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ087QUFDUCxFQUFFLDJFQUFjO0FBQ2hCOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0EsVUFBVTtBQUNWIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vd2ViYXBwLWNvbnZlcnNhdGlvbi8uL25vZGVfbW9kdWxlcy9tZGFzdC11dGlsLW5ld2xpbmUtdG8tYnJlYWsvbGliL2luZGV4LmpzP2Y4MjUiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAdHlwZWRlZiB7aW1wb3J0KCdtZGFzdCcpLkNvbnRlbnR9IENvbnRlbnRcbiAqIEB0eXBlZGVmIHtpbXBvcnQoJ21kYXN0JykuUm9vdH0gUm9vdFxuICogQHR5cGVkZWYge2ltcG9ydCgnbWRhc3QtdXRpbC1maW5kLWFuZC1yZXBsYWNlJykuUmVwbGFjZUZ1bmN0aW9ufSBSZXBsYWNlRnVuY3Rpb25cbiAqL1xuXG4vKipcbiAqIEB0eXBlZGVmIHtDb250ZW50IHwgUm9vdH0gTm9kZVxuICovXG5cbmltcG9ydCB7ZmluZEFuZFJlcGxhY2V9IGZyb20gJ21kYXN0LXV0aWwtZmluZC1hbmQtcmVwbGFjZSdcblxuLyoqXG4gKiBUdXJuIG5vcm1hbCBsaW5lIGVuZGluZ3MgaW50byBoYXJkIGJyZWFrcy5cbiAqXG4gKiBAcGFyYW0ge05vZGV9IHRyZWVcbiAqICAgVHJlZSB0byBjaGFuZ2UuXG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqICAgTm90aGluZy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5ld2xpbmVUb0JyZWFrKHRyZWUpIHtcbiAgZmluZEFuZFJlcGxhY2UodHJlZSwgL1xccj9cXG58XFxyL2csIHJlcGxhY2UpXG59XG5cbi8qKlxuICogUmVwbGFjZSBsaW5lIGVuZGluZ3MuXG4gKlxuICogQHR5cGUge1JlcGxhY2VGdW5jdGlvbn1cbiAqL1xuZnVuY3Rpb24gcmVwbGFjZSgpIHtcbiAgcmV0dXJuIHt0eXBlOiAnYnJlYWsnfVxufVxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/mdast-util-newline-to-break/lib/index.js\n");

/***/ })

};
;