const APICategories = (function () {
    let categories  = JSON.parse($.ajax({
        url: "/api/categories",
        method: "get",
        global: false,
        async: false,
        success: function (data) {
            return data;
        }
    }).responseText);;
    const init = function () {
        categories = JSON.parse($.ajax({
            url: "/api/categories",
            method: "get",
            global: false,
            async: false,
            success: function (data) {
                return data;
            }
        }).responseText);
        return categories;
    }
    const load = function (selectID) {
        init();
        const selectElement = document.getElementById(selectID)
        //selectElement.innerHTML = "";
        categories.forEach(c => {
            const optionElement = document.createElement('option');
            optionElement.text = c.name;
            optionElement.value = c.id;
            selectElement.appendChild(optionElement)
        });
        return new Promise((resolve, reject) => {
            if (!categories) reject();
            else resolve();
        });
    };
    const populate = function (productID) {
        init();
        return categories.find(x => {
            let products = x.product;
            if (products.find(e => e.id == productID) != undefined) return true;
            return false;
        }).name;
    }
    const getProducts = categoryID => categories.find(x => x.id == categoryID).product;
    return {
        populate,
        load,
        init,
        getProducts
    }
})();