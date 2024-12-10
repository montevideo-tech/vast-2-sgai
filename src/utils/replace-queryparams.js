function updateQueryParams(url, params) {
    console.log(url)
    const urlObj = new URL(url);
    console.log(urlObj)
    // Update or add the params
    for (const [key, value] of Object.entries(params)) {
        urlObj.searchParams.set(key, value);
    }

    return urlObj.toString();
}

module.exports = updateQueryParams