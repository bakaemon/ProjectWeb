let formatDate = function (datetimestring, format="y-m-d") {
    let datestring = datetimestring.split("T")[0];
    let timestring = datetimestring.split("T")[1];
    let year = datestring.split("-")[0];
    let month = datestring.split("-")[1];
    let day = datestring.split("-")[2];
    let formatedDate = format.replace("y", year).replace("m", month).replace("d", day);
    return formatedDate;
};
var shoppingList = (function () {
    var productList = [],
        productList = JSON.parse($.ajax({
            url: "/api/products",
            method: "get",
            global: false,
            async: false,
            success: function (data) {
                return data;
            }
        }).responseText);
    var displayList = function (category="all") {
        let products;
        if (category == "all") products = productList;
        else products = APICategories.getProducts(category)
        console.log(products);
        var domlist = $('#product-list');
        domlist.html("")
        products.forEach(product => {
            let producedDate = formatDate(product.producedDate, "d-m-y")
            
            var cardItem = `
              <div class="col-12 col-sm-8 col-md-6 col-lg-4">
                <div class="card" style="width: 20rem;">
                  <img class="card-img" id="${product.id}" src="${product.image}" style="max-width: 250px; max-height: 250px">
                  <!--<div class="card-img-overlay d-flex justify-content-end">
                    <a href="#" class="card-link text-danger like">
                      <i class="fas fa-heart"></i>
                    </a>
                  </div>-->
                  <div class="card-body">
                    <h4 class="card-title">${product.name}</h4>
                    <h6 class="card-subtitle mb-2 text-muted">Produced Date: ${producedDate}</h6>
                    <p class="card-text">
                    <!--${product.description}-->
                      <div class="price text-success"><h5 class="mt-4">${product.price}</h5></div>
                      <button data-name="${product.id}" data-price="${product.price}" 
                      class="add-to-cart btn btn-primary"><i class="fas fa-shopping-cart"></i> Add to cart</button>
                    </div>
                  </div>
                </div>
              </div>`;
            domlist.append(cardItem);
        })
    }

    return {
        display: displayList,
        products: productList
    }
})();
var shoppingCart = (function () {
    cart = [];

    function Item(name, price, count) {
        this.name = name;
        this.price = price;
        this.count = count;
    }

    function saveCart() {
        localStorage.setItem('shoppingCart', JSON.stringify(cart));
    }
    function loadCart() {
        cart = JSON.parse(localStorage.getItem('shoppingCart'));
    }
    if (localStorage.getItem("shoppingCart") != null) {
        loadCart();
    }



    var obj = {};

    // Add to cart
    obj.addItemToCart = function (name, price, count) {
        for (var item in cart) {
            if (cart[item].name === name) {
                cart[item].count++;
                saveCart();
                return;
            }
        }
        var item = new Item(name, price, count);
        cart.push(item);
        saveCart();
    }
    // Set count from item
    obj.setCountForItem = function (name, count) {
        for (var i in cart) {
            if (cart[i].name === name) {
                cart[i].count = count;
                break;
            }
        }
    };
    // Remove item from cart
    obj.removeItemFromCart = function (name) {
        for (var item in cart) {
            if (cart[item].name === name) {
                cart[item].count--;
                if (cart[item].count === 0) {
                    cart.splice(item, 1);
                }
                break;
            }
        }
        saveCart();
    }

    // Remove all items from cart
    obj.removeItemFromCartAll = function (name) {
        for (var item in cart) {
            if (cart[item].name === name) {
                cart.splice(item, 1);
                break;
            }
        }
        saveCart();
    }

    // Clear cart
    obj.clearCart = function () {
        cart = [];
        saveCart();
    }

    // Count cart 
    obj.totalCount = function () {
        var totalCount = 0;
        for (var item in cart) {
            totalCount += cart[item].count;
        }
        return totalCount;
    }

    // Total cart
    obj.totalCart = function () {
        var totalCart = 0;
        for (var item in cart) {
            totalCart += cart[item].price * cart[item].count;
        }
        return Number(totalCart.toFixed(2));
    }

    // List cart
    obj.listCart = function () {
        var cartCopy = [];
        for (i in cart) {
            item = cart[i];
            itemCopy = {};
            for (p in item) {
                itemCopy[p] = item[p];

            }
            itemCopy.total = Number(item.price * item.count).toFixed(2);
            cartCopy.push(itemCopy)
        }
        return cartCopy;
    }

    return obj;
})();


function displayCart() {
    var cartArray = shoppingCart.listCart();
    var output = "";
    for (var i in cartArray) {
        output += "<tr>"
            + "<td>" + cartArray[i].name + "</td>"
            + "<td>(" + cartArray[i].price + ")</td>"
            + "<td><div class='input-group'><button class='minus-item input-group-addon btn btn-primary' data-name=" + cartArray[i].name + ">-</button>"
            + "<input type='number' class='item-count form-control' data-name='" + cartArray[i].name + "' value='" + cartArray[i].count + "'>"
            + "<button class='plus-item btn btn-primary input-group-addon' data-name=" + cartArray[i].name + ">+</button></div></td>"
            + "<td><button class='delete-item btn btn-danger' data-name=" + cartArray[i].name + ">X</button></td>"
            + " = "
            + "<td>" + cartArray[i].total + "</td>"
            + "</tr>";
    }
    $('.show-cart').html(output);
    $('.total-cart').html(shoppingCart.totalCart());
    $('.total-count').html(shoppingCart.totalCount());
}

// Delete item button

$('.show-cart').on("click", ".delete-item", function (event) {
    var name = $(this).data('name')
    shoppingCart.removeItemFromCartAll(name);
    displayCart();
})


$('.show-cart').on("click", ".minus-item", function (event) {
    var name = $(this).data('name')
    shoppingCart.removeItemFromCart(name);
    displayCart();
})

$('.show-cart').on("click", ".plus-item", function (event) {
    var name = $(this).data('name')
    shoppingCart.addItemToCart(name);
    displayCart();
})

// Item count input
$('.show-cart').on("change", ".item-count", function (event) {
    var name = $(this).data('name');
    var count = Number($(this).val());
    shoppingCart.setCountForItem(name, count);
    displayCart();
});
shoppingList.display();
displayCart();


$('.clear-cart').click(function () {
    if (shoppingCart.totalCount() == 0) return alert("There is nothing in the cart right now.");
    if (confirm("Are you sure?")) {
        shoppingCart.clearCart();
        displayCart();
    }
});

$('.add-to-cart').click(function (event) {
    event.preventDefault();
    var id = $(this).data('name');
    var name = shoppingList.products.find(x => x.id == Number(id)).name
    var price = Number($(this).data('price'));
    shoppingCart.addItemToCart(name, price, 1);
    displayCart();
});

$('#categories').on('change', () => {
    shoppingList.display($('#categories').val());
})

function togglePopup(id) {
    var itemID = id.split('-')[1];
    var popup = document.getElementById(itemID);
    popup.classList.toggle("show");
}


