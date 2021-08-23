const ajaxLogin = (function () {
    'use strict';
    let init = formData => {
        $('#username1').removeClass('is-invalid')
        $('#password1').removeClass('is-invalid');
        $('button#login').prop('disabled', true);
        $.ajax({
            url: "/login",
            data: { username: formData.get('username'), password: formData.get('password') },
            method: "post",
            error: (jqxhr) => {
                let status = jqxhr.status;
                if (status === 403) {
                    let data = JSON.parse(jqxhr.responseText);
                    let u_err = data['username-error'] || null;
                    if (u_err) {
                        $('#username1').addClass('is-invalid')
                        $('#username-error').text(u_err);
                    }
                    let p_err = data['password-error'] || null;
                    if (p_err) {
                        $('#password1').addClass('is-invalid');
                        $('#password-error').text(p_err);
                    }

                } else {
                    alert("Interal Serval Error, please try again later.")
                }
            },
            success: () => {
                alert("Login successfully!");
                window.location.reload();
            }
        }).always(() => { $('button#login').prop('disabled', false); });
        
    }
    return {
        init
    }
})(jQuery);
/**
 * https://codepen.io/cristinaconacel/pen/OBYajE
 */
(function () {
    'use strict';
    window.addEventListener('load', function () {
        // Get the forms we want to add validation styles to
        var forms = document.getElementsByClassName('needs-validation');
        if (forms.length == 0) {
            let form = document.getElementById('login') || document.getElementById('signup');
            form.addEventListener('submit', (event) => {
                if (form.checkValidity() === false) {
                    event.preventDefault();
                    form.classList.add('was-validated');
                    event.stopPropagation();
                } else {
                    event.preventDefault();
                    const formData = new FormData(event.target);
                    ajaxLogin.init(formData);
                    event.stopPropagation();
                }
            }, false)

        } else {
            // Loop over them and prevent submission
            Array.prototype.filter.call(forms, function (form) {
                form.addEventListener('submit', function (event) {
                    if (form.checkValidity() === false) {
                        event.preventDefault();
                        event.stopPropagation();
                    } else {
                        const formData = new FormData(event.target);
                        ajaxLogin.init(formData);
                    }
                    form.classList.add('was-validated');
                }, false);
            });
        }
    }, false);
})();