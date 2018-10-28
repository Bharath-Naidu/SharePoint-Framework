import { Version, Environment, EnvironmentType } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-webpart-base';
import { escape } from '@microsoft/sp-lodash-subset';
//import CanvasJS from 'canvasjs';
import styles from './VoteMeWebPart.module.scss';
import * as strings from 'VoteMeWebPartStrings';
import{SPComponentLoader}from '@microsoft/sp-loader';
//import * as $ from 'jquery';
import 'jquery';
import { ISPHttpClientOptions, SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
require('bootstrap');

var Buttonid;
var CurrentLoginUser:string;
var UserStatus:boolean;
export interface IVoteMeWebPartProps {
  description: string;
}

export default class VoteMeWebPart extends BaseClientSideWebPart<IVoteMeWebPartProps> 
{

  public render(): void 
  {
    let url="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css";
    SPComponentLoader.loadCss(url);
    this.domElement.innerHTML = `
    <div class="btn-toolbar" role="toolbar" aria-label="Toolbar with button groups" id="contents">
    </div>
     </br></br></br>
        <div class="modal-footer">
          <button type="button" id="submit">Submit</button>
        </div>
    </div>

    <div class="modal fade" id="myModal" role="dialog">
    <div class="modal-dialog">
    
      <!-- Modal content-->
      <div class="modal-content">
        <div class="modal-header" id="Header">
          <button type="button" class="close" data-dismiss="modal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="container-fluid">
            <div class="row content">
                <div class="col-sm-5 sidenav" id="Sidepart">

                </div>
            <div class="col-sm-7" id="Middle">
          
            </div>
        </div>
      </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
        </div>
      </div>
      
    </div>
  </div>

    `;
    
  var absurl = this.context.pageContext.web.absoluteUrl;
  CurrentLoginUser=this.context.pageContext.user.email;
    $(document).ready(function(){
      //alert("ready called");
        /***************DSC**************** */
        var call = jQuery.ajax(
          {
              url: absurl + `/_api/web/Lists/GetByTitle('ParticipantsBharath')/items?$select=Title,ID`,
              type: "GET",
              dataType: "json",
              headers: 
              {
                  Accept: "application/json;odata=verbose"
              }
          });
          call.done(function (data, textStatus, jqXHR) {
              var button=$('#contents');
              $.each(data.d.results,function(val,value)
              {
                 button.append(`<div class="btn-group mr-2" role="group" aria-label="First group">
                 <button type="button" class="btn btn-secondary" id="${value.ID}">${value.Title}</button></div>`);
              });
          });
          call.fail(function (jqXHR, textStatus, errorThrown) {
              var response = JSON.parse(jqXHR.responseText);
              var message = response ? response.error.message.value : textStatus;
              alert("Call failed. Error: " + message);
          });
        /********************DSC************* */
      // $(".btn").click(function()
      // {
      //   alert("fdsfsd");
      //   Buttonid=this.id;
      //   alert(Buttonid);
      // });
      
      $(document).on('click','.btn-secondary',function()
      {
        
        $('.btn').click(function()
        {
          Buttonid=this.id;
        });
        //alert("button");
        //Buttonid=$('.btn').id;
      });
      // $('#submit').click(function(){
        
      // });
    });
    //this.getCurrentUser();
    
    
    this.UserIsUseTheVoterList();
    this.calltovote();
  }
  
    
    
//---------------------------------------------------------------------------------------------------

  private calltovote()
  { 
    alert("present status is:"+UserStatus);
      document.getElementById("submit").addEventListener('click',()=>this.SaveVote());  
  }
  protected get dataVersion(): Version 
  {
    return Version.parse('1.0');
  }
  //-----------------------Find the user is use the vote or not------------------------
  private UserIsUseTheVoterList()
  {
    alert("finding user is use the vote or not");
    
    var call = jQuery.ajax(
            {
                url: this.context.pageContext.web.absoluteUrl + `/_api/web/Lists/GetByTitle('AllVoters')/items?$select=Title,Vote&$filter=Title eq '${CurrentLoginUser}'`,
                type: "GET",
                dataType: "json",
                headers: 
                {
                    Accept: "application/json;odata=verbose"
                }
            });
            alert("After call in UserIsUseTheVoterList method");
            call.done(function (data, textStatus, jqXHR)
             {
               //alert("User is Use the vote");
               
               var EnterCondiation:boolean=true;
                // var button=$('#contents');
                $.each(data.d.results,function(val,value)
                {
                  
                  var returnvalue=value.Title;
                  alert("Title is "+returnvalue);
                  if(returnvalue===CurrentLoginUser)
                  {
                    UserStatus=false;
                    EnterCondiation=false;
                  }
                  alert("false");
                  var POPUP=$('#Sidepart');
                  POPUP.append(`<h3> You are already use your vote.</h3>`);
                  $('#submit').attr("disabled", "disabled");
                  $(".btn").removeClass('active').addClass('disabled');
                  $('#'+value.Vote).removeAttr('class');
                  $('#'+value.Vote).addClass('active btn btn-primary');
                });
                if(EnterCondiation)
                {
                  UserStatus=true;
                  alert("true");
                }
            });
            call.fail(function (jqXHR, textStatus, errorThrown) {
              alert("User not use the vote");
                var response = JSON.parse(jqXHR.responseText);
                var message = response ? response.error.message.value : textStatus;

            });
  }
  //---------------------------------------adding vote to list--------------------------------
  public SaveVote() 
  {
    alert("SaveVote is called");
    if(UserStatus)
    {
            alert("coming is added a vote "+UserStatus);
          if (Environment.type === EnvironmentType.Local) {
            this.domElement.querySelector('#listdata').innerHTML = "Sorry this does not work in local workbench";
          } 
          else{
            
          var Userid=CurrentLoginUser;
          alert("Location is : "+Buttonid);
          const spOpts: ISPHttpClientOptions = {
            body: `{ Vote: '${Buttonid}', Title:  '${Userid}'}`
          };
          var Url= this.context.pageContext.web.absoluteUrl+ "/_api/web/lists/getByTitle('AllVoters')/Items";
          this.context.spHttpClient.post(
            Url, SPHttpClient.configurations.v1,spOpts)
            .then((response: SPHttpClientResponse) => {
              console.log("After creation response", response);

              response.json().then((responseJSON: JSON) => {
                console.log("JSON", responseJSON);
              });

              if (response.ok) {
                alert("added");
              
              }else
              alert("fail");
              
              return;

            })
            .catch((error: SPHttpClientResponse) => {
              console.log(error);
              return;
            });
          }
    
  }else{
    alert("not enter  "+ UserStatus);
  }
  
  }
  //---------------------------------Getting Login User----------------------------------
  private getCurrentUser()
  {
    alert("Read Userid");
    var call = jQuery.ajax(
      {
          url: this.context.pageContext.web.absoluteUrl + `/_api/web/currentuser`,
          type: "GET",
          dataType: "json",
          headers: 
          {
              Accept: "application/json;odata=verbose"
          }
      });
      alert("after call the getCurrentUser");
      call.done(function (data, textStatus, jqXHR) {
        alert("User id successfully find");
        CurrentLoginUser=data.d.Title;
        alert(CurrentLoginUser);
    });
    call.fail(function (jqXHR, textStatus, errorThrown) {
      alert("fail in find user id");
        var response = JSON.parse(jqXHR.responseText);
        var message = response ? response.error.message.value : textStatus;
        alert("Call failed. Error: " + message);
    });
  }


  //-----------------------------------getting places----------------------------
  // private getListsInfo() 
  // {
  //   //URLPATH=this.context.pageContext.web.absoluteUrl; 
  //   //alert("coming here");
  //   if (Environment.type === EnvironmentType.Local)
  //    {
  //     var message=$('#dataHere');
  //     message.append("Sorry this does not work in local workbench");
  //     } else 
  //     { 
  //     var call = jQuery.ajax(
  //       {
  //           url: this.context.pageContext.web.absoluteUrl + `/_api/web/Lists/GetByTitle('ParticipantsBharath')/items?$select=Title,ID`,
  //           type: "GET",
  //           dataType: "json",
  //           headers: 
  //           {
  //               Accept: "application/json;odata=verbose"
  //           }
  //       });
  //       call.done(function (data, textStatus, jqXHR)
  //        {
  //           var button=$('#contents');
  //           $.each(data.d.results,function(val,value)
  //           {
  //              button.append(`<div class="btn-group mr-2" role="group" aria-label="First group">
  //              <button type="button" class="btn btn-secondary" id="${value.ID}">${value.Title}</button></div>`);
  //           });
  //       });
  //       call.fail(function (jqXHR, textStatus, errorThrown) {
  //           var response = JSON.parse(jqXHR.responseText);
  //           var message = response ? response.error.message.value : textStatus;
  //           alert("Call failed. Error: " + message);
  //       });
    
  //   }
  // }
  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
