
const APIProduct = (function () {
    var data = [],
        data = JSON.parse($.ajax({
            url: "/api/products",
            method: "get",
            global: false,
            async: false,
            success: function (data) {
                return data;
            }
        }).responseText);
    var reload = function () {
        newdata = JSON.parse($.ajax({
            url: "/api/products",
            method: "get",
            global: false,
            async: false,
            success: function (data) {
                return data;
            }
        }).responseText);
        if (newdata) data = newdata;
        return new Promise((resolve, reject) => {
            if (newdata == data) {
                resolve();
            }
            else reject();
        })
    }
    var getData = function () {
        reload();
        return data;
    }
    var findData = function (criteria) {
        return data.find(x => x.id == criteria);
    };
    var loadTable = function () {
        var domlist = $('#product-list');
        domlist.html("")
        data.forEach(product => {
            var cardItem = `
            <tr>
                <th scope="row">${product.id}</th>
                <td>
                <img id="${product.id}" onclick="editImage(this.id)" style="max-width: 50px; max-height: 50px" src="${product.image}">
                </td>
                <td><p onclick="editText(this.id)" id="name-${product.id}">${product.name}</p></td>
                <td><p id="price-${product.id}" onclick="editText(this.id)">${product.price}</p></td>
                <td><p id="category-${product.category.id}-${product.id}" onclick="editCat(this.id)">${APICategories.populate(product.category.id)}</p></td>
                <td><p id="description-${product.id}" onclick="editText(this.id)">${product.description}</p></td>
                <td><p onclick="del('${product.id}')"><i class="bi bi-trash-fill"></i></p></td>
            </tr>`;
            domlist.append(cardItem);
        });
    }
    return {
        loadTable: loadTable,
        data: getData,
        reload: reload,
        find: findData
    }
})();
var _SerializeFormData = function (formData) {
    let obj = {};
    formData.forEach(function (value, key) {
        obj[key] = value;
    });
    return obj;
}
var _save = function (data) {
    return $.ajax({
        url: "/api/edit",
        method: "post",
        data: data
    });
}
var createProduct = function (form) {

    const formData = new FormData(form);
    $.ajax({
        url: "/api/new",
        method: "post",
        data: _SerializeFormData(formData),
        success: () => {
            APIProduct.reload().then(() => {
                $('#addNew').modal('toggle');
            }).then(APIProduct.loadTable);
        },
        error: () => {
            alert("Unable to add product: Interal Server Error.");
        }
    });
    return false;
}
var editText = async function (elID) {
    $el = $("#" + elID)
    $el.focus();
    var inputName = elID.split("-")[0];
    var productID = elID.split("-")[1];
    if (inputName == "description")
        $el.replaceWith(`<textarea id="${inputName}-${productID}" 
        style="display: block; width: 100%">${$el.text()}</textarea>`);
    else $el.replaceWith(`<input id="${inputName}-${productID}" class="form-control" type="name" value="${$el.text()}"/>`)
    $input = $('#' + `${inputName}-${productID}`)
    $input.focus();
    var saveText = async function () {
        if (inputName == "name") { await _save({ id: Number(productID), name: $input.val() }); }
        if (inputName == "price") { await _save({ id: Number(productID), price: $input.val() }); }
        if (inputName == "description") { await _save({ id: Number(productID), description: $input.val() }); }
        $input.replaceWith(`<a href="javascript:;" onclick="editText(this.id)" id="${inputName}-${productID}">${$input.val()}</a>`)
    }
    $input.blur(async () => {
        await saveText();
        APIProduct.reload().then(APIProduct.loadTable);
    }).keypress(async (e) => {
        if (e.which == 13) {
            await saveText();
            APIProduct.reload().then(APIProduct.loadTable);
            // return false;
        }
    });
}

var del = function (id) {
    APIProduct.reload().then(async () => {
        var data = await APIProduct.data();
        if (confirm("Are you sure to delete '" + data.find(x => x.id == id).name + "'?")) {
            $.ajax({
                url: "/api/delete",
                method: "post",
                data: { id: id },
                success: function () {
                    APIProduct.reload().then(APIProduct.loadTable);
                    alert("Deleted " + data.find(x => x.id == id).name + " successfully!");
                }
            });
        }
    });

}
Dropzone.autoDiscover = false;
function editImage(id) {
    let product = APIProduct.find(id);
    let productName = product.name;
    $('#productName').text("Editting image of \"" + productName + "\"")
    $modal = $('#imageUpload')
    $modal.modal('show');
    var myDropzone = new Dropzone("#mydropzone", {
        url: "/api/edit",
        addRemoveLinks: true,
        autoProcessQueue: true,
        maxFilesize: 10,
        maxFiles: 1,
        acceptedFiles: ".jpeg,.jpg,.png,.gif,.webp",
        dictFileTooBig: "File is to big ({{filesize}}mb). Max allowed file size is {{maxFilesize}}mb",
        dictInvalidFileType: "Invalid File Type",
        dictCancelUpload: "Cancel",
        dictRemoveFile: "Remove",
        dictMaxFilesExceeded: "Only {{maxFiles}} files are allowed",
        dictDefaultMessage: "Drop files here to upload",
    });
    myDropzone.on("sending", function (file, xhr, formData) {
        formData.append("id", id);
    });
    myDropzone.on('success', function (file, response) {
        var imgName = response;
        file.previewElement.classList.add("dz-success");
        myDropzone.removeAllFiles();
        alert("Successfully uploaded :" + imgName);
        $modal.modal('hide');
        APIProduct.reload().then(APIProduct.loadTable);
    });
    myDropzone.on('error', function (file, response) {
        file.previewElement.classList.add("dz-error");
    });
}

const editCat = async function (eID) {
    try {
        let categoryId = eID.split("-")[1];
        let productId = eID.split("-")[2];
        let productData = APIProduct.find(productId);
        let $el = $("#" + eID);
        $selectFrame = $('<select/>');
        $selectFrame.attr('id', 'edit_category');
        $el.replaceWith($selectFrame);
        $select = $('#edit_category');
        await APICategories.load('edit_category');
        let newValue = $select.val();
        $select.on('change', () => {
            alert('Changing...')
                _save({ id: Number(productId), category_id: newValue }).done(() => {
                    APIProduct.reload().then(APIProduct.loadTable());
                    $select.replaceWith(`<p id="category-${productData.category.id}-${productData.id}" onclick="editCat(this.id)">${APICategories.populate($select.val())}</p>`)
                }).fail(() => {
                    alert("Error orrcured, nothing changed.");
                    $select.replaceWith(`<p id="category-${productData.category.id}-${productData.id}" onclick="editCat(this.id)">${APICategories.populate($select.val())}</p>`)
                });
            
        });
    } catch (e) {
        console.log(e)
    }
}
