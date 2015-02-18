$(document).ready(function() {
    $('select').select2();
    $('#poll').masonry({
        columnWidth: 350,
        itemSelector: '.panel',
        gutter: 10,
        stamp: ".top"
    });
    var reindex = function() {
        tinysort('ul#poll>li', {
            data:'count',
            order:'desc'
        });
        $('#poll').masonry('reloadItems');
        $('#poll').masonry();
        $('li').removeClass('top');
        $('li').first().addClass('top');
    };
    reindex();
    realplexor.registerCallback("Add", function (result) {
        return function (result, id) {
            $('#poll').append(result);
            reindex();
        };
    });
    realplexor.registerCallback("Update", function (result) {
        return function (result, id) {
            var selector = '.item-' + result['id'];
            $(selector).find('.js-counter').text(result['count']);
            $(selector).attr('data-count', result['count']);
            reindex();
        };
    });
    realplexor.subscribeChannel("Add_Song");
    realplexor.subscribeChannel("Update_Song");
    realplexor.startListen();
    $('.js-ajax-form').on('click', function() {
        var self = this;
        $("form").submit(function(e)
        {
            var postData = $(this).serializeArray();
            var formURL = $(this).attr("action");
            $.ajax(
                {
                    url : formURL,
                    type: "POST",
                    data : postData,
                    success:function(data, textStatus, jqXHR)
                    {
                        $('#add-modal').modal('hide');
                        if(data.view){
                            //$('#poll').append(data.view);
                            //reindex();
                        }
                    },
                    error: function(jqXHR, textStatus, errorThrown)
                    {
                        //if fails
                    }
                });
            e.preventDefault(); //STOP default action
        });

        $("form").submit();
    });
    $('body').on('click', '.js-ajax', function() {
        var self = this;
        $.ajax({
            url: $(this).data('url'),
            type: "POST",
            beforeSend: function(){
            },
            success: function(data) {
                if (data.count != undefined) {
                    //$(self).parent().find('.js-counter').text(data.count);
                    //$(self).closest('li').attr('data-count', data.count);
                    //reindex();
                } else if (data.error) {
                    $('#error-modal').find('.js-description').text(data.error);
                    $('#error-modal').modal();
                    $('audio').trigger("play");
                }
            },
            complete: function() {
            }
        });
    });
});