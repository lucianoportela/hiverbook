/**
 * Remove acentos de caracteres
 * @param  {String} stringComAcento [string que contem os acentos]
 * @return {String}                 [string sem acentos]
 */
function removerAcentos( newStringComAcento ) {
  var string = newStringComAcento;
    var mapaAcentosHex  = {
        a : /[\xE0-\xE6]/g,
        e : /[\xE8-\xEB]/g,
        i : /[\xEC-\xEF]/g,
        o : /[\xF2-\xF6]/g,
        u : /[\xF9-\xFC]/g,
        c : /\xE7/g,
        n : /\xF1/g
    };
 
    for ( var letra in mapaAcentosHex ) {
        var expressaoRegular = mapaAcentosHex[letra];
        string = string.replace( expressaoRegular, letra );
    }
 
    return string;
}

$('#search').on('keyup', function() {

var str= removerAcentos($('#search').val());

  var allLinks = $('ul')
,   il       = allLinks.length
,   i        = 0
,   test
,   alrt;

while (i < il) {
  elm  = allLinks[i++];
  test = elm.getAttribute("data-name");
  if (test!=null)
  {
    strAcento=removerAcentos(test);
    if (strAcento.toLowerCase().indexOf(str.toLowerCase()) > -1) 
    {
      $("[data-name='"+test+"']").show(400);
       //console.log(elm);
       //foundLinks++;   
    }
    else{
      $("[data-name='"+test+"']").hide(400);

    }
  }
  
}

$(".im_dialogs_search_clear").click(function(){
  $('#search').val("");
  $("[data-name]").show(400);
})

       //$("[data-name=joao]").slideDown(400);
   /*    var str = $('#search').val();
       var namefull=$("[data-name]").val();
       alert($('ul').data('data-name'));
    alert(namefull.indexOf("jo") > -1);

     //  $("[data-name=joao]").hide(400);*/

});

$('#file').on('change', function() {
    var delimeter = ': ';
    var file = $('#file').get(0).files[0];
 

    $('#fileName').text(['Name', file.name].join(delimeter));
    $('#fileSize').text(['Size', file.size].join(delimeter));
    $('#fileType').text(['Type', file.type].join(delimeter));

               var reader = new FileReader();

                reader.onload = function (e) {
                    $('#mini_foto_new').attr('src', e.target.result);
                }
                reader.readAsDataURL(file);
    $("#btn-img-post").hide();
    $('.template-upload').show();

});
 
$('#btnCanceImg').on('click', function() {
	$('#file').get(0).files[0]="";
	file="";
	$('#fileName').text("");
	$('#mini_foto_new').attr('src', '');
	$('#fileElementId').val("");
    $("#btn-img-post").show();
   $('.template-upload').hide();


});


function backUsers() {  
   $('#search').val("");

        $.ajax({
              url: "/showusers",
              dataType: "json",
              data:{},
              error   : function()
              {
                   console.log('error occured when trying to find the from city');
               },
              success: function( response ) 
              {
                  $(".user-container").text("");
                  $(".chat-room-head").hide();
                  $("#user-head-users").show();
                  $("#user-head-private").hide();
                  $(".user-footer").show();

                  $(".user-container").append(response.html)
                }
          });    





}


$('body').on('click','.im_dialog_wrap', function() {
    var friend=$.parseJSON($(this).attr("friend"));



    if (friend.to==undefined)
    {

     friend={ _id:"538f57ea0bd484802a000002",
                 from:{
                    id:"undefined",
                    name:"undefined",
                    imgpath:"undefined"},
                  to:{ id:friend._id,
                       name:friend.local.name,
                       imgpath:friend.local.imgpath},
                 message:" ",
                 lastPosted:"June 6th 2014, 12:24:35 pm",
                 qtd:0}

}
        $('#userNomePrivate').text(friend.to.name);
        $('#userImgpathPrivate').attr('src',(friend.to.imgpath));

    
        $.ajax({
              url: "/messageprivate",
              dataType: "json",
              data: friend,
              error   : function()
              {
                   console.log('error occured when trying to find the from city');
               },
              success: function( response ) 
              {
                  $(".user-container").text("");
                  $(".chat-room-head").show();
                  $("#user-head-users").hide();
                  $("#user-head-private").show();
                  $(".user-footer").hide();

                  $(".user-container").append(response.html)
              /*    response( $.map( data.results, function( item ) {
                       return {
                          label: item,
                          value: item
                       }
                  }));/*/
                }
          });





});
//href="/home?x={{this.to.id}}"

$('#btn-post').on('click', function() {


    var fd = new FormData();
    fd.append('uploadingFile', $('#file').get(0).files[0]);
    var el = $('#file').get(0).files[0];
    if( el == undefined )
    {

        if ($('#msg-post').val().toString()=="")
        {
            return false;
        }
     	fd.append('existeFoto','false');	
     	fd.append('nomeImagem' ,'');
    }
    else{
     	fd.append('existeFoto','true');

 	    var rand = 60/$('#file').get(0).files[0].size;
        var d = new Date();

       fd.append('nomeImagem' ,Math.floor(d.getSeconds()/rand)+$('#file').get(0).files[0].name);

    }





    fd.append('date', (moment().fromNow()).toString()); // req.body.date
    fd.append('comment', 'This is a test.'); // req.body.comment
    fd.append('userId', $('#from-user-post-id').val());
    fd.append('userName', $('#from-user-post-name').val());
    fd.append('userImg', $('#from-user-post-imgpath').val());
    fd.append('userPostMsg', $('#msg-post').val());

    var xhr = new XMLHttpRequest();
 
    xhr.upload.addEventListener("progress", uploadProgress, false);
    xhr.addEventListener("load", uploadComplete, false);
    xhr.addEventListener("error", uploadFailed, false);
    xhr.addEventListener("abort", uploadCanceled, false);
    xhr.open("POST", "/novoPost");
    xhr.send(fd);
    $('#file').val("");
    $("#fileupload")[0].reset();
    /*
    var xhr = $.ajax({
        url: '/fileUpload',
        data: fd,
        contentType: false,
        processData: false,
        type: 'POST'
    });
    */
});
 
function uploadProgress(evt) {
    if(evt.lengthComputable) {
        var percentComplete = Math.round(evt.loaded * 100 / evt.total);
        $('#progress').text(percentComplete.toString() + '%');
    } else {
        $('#progress').text('unable to compute');
    }
}
 
function uploadComplete(evt) {
    uploadProgress(evt);
    var obj = $.parseJSON(evt.srcElement.response)
    $('.panel-body').prepend(obj.html)
    $(".template-upload").hide();
    $("#btn-img-post").show();
    $('#msg-post').val("");
    $('#file').val("");
	file="";
	$('#fileName').text("");
    //alert(obj.html);
}
 
function uploadFailed(evt) {
    alert("There was an error attempting to upload the file.");
}
 
function uploadCanceled(evt) {
    alert("The upload has been canceled by the user or the browser dropped the connection.");
}