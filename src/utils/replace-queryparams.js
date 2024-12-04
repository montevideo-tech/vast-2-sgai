function updateQueryParams(url, params) {
    const urlObj = new URL(url);

    // Update or add the params
    for (const [key, value] of Object.entries(params)) {
        urlObj.searchParams.set(key, value);
    }

    return urlObj.toString();
}

module.exports = updateQueryParams