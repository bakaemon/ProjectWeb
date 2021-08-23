/**
 * Paginating array to array of smaller arrays.
 * @param {Array} array the original array
 * @param {Number} size size of smaller array
 * @returns {Array} array of smaller arrays
 */
function paginate(array, size) {
    return array.reduce((acc, val, i) => {
        let idx = Math.floor(i / size)
        let page = acc[idx] || (acc[idx] = [])
        page.push(val)

        return acc
    }, [])
}