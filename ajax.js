//========================================================================================
// Contains AJAX 2 methods:
// ajaxRequest: Execute a full AJAX request/response communication
// ajaxLoad:    Use ajaxRequest() in sync mode to load a url into an html element 
//========================================================================================
// ajaxRequest: Execute an AJAX HTTP request from a server
//        args: url      - the url that you want to call
//              method   - GET or POST (if none provided, POST will be used)
//              param    - the data you want to send to the server (if any)
//              callback - the name of a user function to call back when load completes
//                         the function will receive:
//                           - responseText - the response in text (or HTML) format  
//                           - responseXML  - the response as an XML DOM  
//                           - responseJSON - the response as a JSON object (not as a string)  
//                           - respHeaders  - the response headers as an array or objects  
//              async    - true or false (if none provided, true/async will be used) 
//      return: none (see callback function)
//========================================================================================
var reqObj;                         //the request object
var respText;                       //the data returned from server as text
var respXML;                        //the data returned from server as XML DOM
var respJSON;                       //the data returned from server as JSON object
var respHeaders;                    //the reponse headers as a single multi-line string
var respHeadersArr = [];            //the reponse headers as an array of objects
var callFunction;                   //the callback function 

function ajaxRequest(url, method, param, callback, async) 
{
    if (typeof(url)     === "undefined") return;                //if none provided, return
    if (typeof(method)  === "undefined") method   = 'POST';     //if none provided, set to POST
    if (typeof(callback)=== "undefined") callback = doResponse; //if none provided, set to doResponse()
    if (typeof(async)   === "undefined") async    = true;       //if none provided, set to async

    param2 = param + "&time=" + new Date().getTime();   //force a new time so IE will not cache 

    if (method == "GET") { 
        url2 = url + "?" + param2;                      //param are appended to end of the url 
        requestBody = "";                               //request body = null
    }
    if (method == "POST") {
        url2 = url;                                     //nothing added to url
        requestBody = param2;                           //param are sent in HTTP request body
    }
    
    callFunction = callback;                            //save function name in a global var

    if (window.XMLHttpRequest)                          //for current W3C browsers
        reqObj = new XMLHttpRequest();
    else if (window.ActiveXObject)                      //for older Internet Explorer
        reqObj = new ActiveXObject("Microsoft.XMLHTTP");

    reqObj.onreadystatechange = ajaxResponse;           //setup a callback function
                                                        //which will be called upon each change
                                                        //in XMLHttpRequest obj readyState 
                                                
    reqObj.open(method, url2, async);                   //setup the HTTP request  

    reqObj.setRequestHeader("Cache-Control","no-cache");    //Do not cache the response data
    reqObj.setRequestHeader("Pragma","no-cache");           //the same - for backward compatibility
    reqObj.setRequestHeader("Content-Type","application/x-www-form-urlencoded");    

    reqObj.send(requestBody);                           //send the HTTP request

    if (! async) ajaxResponse();                        //if sync mode, manually execute ajaxResponse function
}

//=================================================================================================
// ajaxResponse: function automatically called for each change in state of HTTP communication 
//=================================================================================================
function ajaxResponse()
{
    if (reqObj.readyState == 4)                             //if ready state = load complete    
        if (reqObj.status == 0 || reqObj.status == 200)     //if response status = OK   
        {
            respText    = reqObj.responseText;              //the response data as text
            respXML     = reqObj.responseXML;               //the response data as XML DOM

//          if (respXML == null)							//attempting to convert HTML to XML 
//          {												//seems not to work since HTML is often   
//              parser  = new DOMParser();                                 //not properly valid
//              respXML = parser.parseFromString(respText,"text/xml");
//          }

            respHeaders = reqObj.getAllResponseHeaders();   //all response headers as a string      

            try {
                respJSON = JSON.parse(respText);            //convert JSON string to JSON object
            }
            catch (error) {
                respJSON = error;
            }

            respHeadersArray = respHeaders.split('\n'); 
            for (i=0; i<respHeadersArray.length; i++)
            {
                respHeader      = respHeadersArray[i].split(':');
                respHeaderName  = respHeader[0];  
                respHeaderValue = respHeader[1];
                respHeadersArr[respHeaderName] = respHeaderValue;
            }   
            callFunction(respText, respXML, respJSON, respHeadersArr);  //call the user's callback function
        }
}
//=========================================================================================
// ajaxLoad: This is a mini ajaxRequest.  (It calls ajaxRequest() above) 
//           It simply requests a text or HTML snippet, and loads it into an html element   
//     args: url     - the url that you want to call
//           element - the id of an html element to place the returned data in   
//=========================================================================================
var elementId;                                              //global id of an HTML element

function ajaxLoad(url, element)
{
    elementId = element;
    ajaxRequest(url, "GET", "", loadData, false);           //load data synchronously
}
//=================================================================================================
// loadData: function automatically called from ajaxResponse() function above
//=================================================================================================
function loadData(respText)
{
    document.getElementById(elementId).innerHTML = respText;
}
//==============================================================================================
