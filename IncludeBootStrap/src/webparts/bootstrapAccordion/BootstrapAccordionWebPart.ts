import { Version, Environment, EnvironmentType } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-webpart-base';
import { escape } from '@microsoft/sp-lodash-subset';
import{SPComponentLoader}from '@microsoft/sp-loader';
import styles from './BootstrapAccordionWebPart.module.scss';
import * as $ from 'jquery';
import * as strings from 'BootstrapAccordionWebPartStrings';
require('bootstrap');
export interface IBootstrapAccordionWebPartProps {
  description: string;
}
var URLPATH:string;
export default class BootstrapAccordionWebPart extends BaseClientSideWebPart<IBootstrapAccordionWebPartProps> {
  
  public render(): void {
    let url="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css";
    SPComponentLoader.loadCss(url);
    this.domElement.innerHTML = `
    <div id="myCarousel" class="carousel slide" data-ride="carousel">
 
  <ol class="carousel-indicators">
    <li data-target="#myCarousel" data-slide-to="0" class="active"></li>
    <li data-target="#myCarousel" data-slide-to="1"></li>
    <li data-target="#myCarousel" data-slide-to="2"></li>
    <li data-target="#myCarousel" data-slide-to="3"></li>
    <li data-target="#myCarousel" data-slide-to="4"></li>
  </ol>


  <div class="carousel-inner" id="Slider">
    <!-- <div class="item active">
      <img src="https://www.w3schools.com/bootstrap/ny.jpg" alt="Los Angeles">
    </div>

    <div class="item" role="listbox"> 
      <img src="chicago.jpg" alt="Chicago">
    </div>

    <div class="item">
      <img src="ny.jpg" alt="New York">
    </div> -->
  </div>

  
   <a class="left carousel-control" href="#myCarousel" data-slide="prev">
    <span class="glyphicon glyphicon-chevron-left"></span>
    <span class="sr-only">Previous</span>
  </a>
  <a class="right carousel-control" href="#myCarousel" data-slide="next">
    <span class="glyphicon glyphicon-chevron-right"></span>
    <span class="sr-only">Next</span>
  </a>
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
  </div>`
      
  $(document).ready(function()
  {  
    
    $(document).on("click", ".btn" , function() 
    {
      var SelectedID=$(this).attr('id'); 
       
      if (Environment.type === EnvironmentType.Local)
      {
       var message=$('#dataHere');
       message.append("Sorry this does not work in local workbench");
       } 
       else 
       {
         
          var call = jQuery.ajax(
          {
             url: URLPATH + `/_api/web/Lists/GetByTitle('Information')/items?select=URL,Title,Description&$filter=ID eq '${SelectedID}'`,
             type: "GET",
             dataType: "json",
             headers: 
             {
                 Accept: "application/json;odata=verbose"
             }
         });
         
         call.done(function (data, textStatus, jqXHR) 
         {
            
             var Mid = jQuery("#Middle");
             var Side = jQuery("#Sidepart");
             jQuery("#Middle").empty();
             jQuery("#Sidepart").empty();
             $.each(data.d.results,function(val,value){
                //AddHeader.append("<h1>"+value.Title+"</h1>");
                Side.append("<br><br><img width=\"200\" height=\"200\" src=\""+value.URL+"\">");
                Mid.append("<h1>"+value.Title+"</h1><br><p>"+value.Description+"</p>");
             });
            });
            call.fail(function (jqXHR, textStatus, errorThrown) {
              
              var response = JSON.parse(jqXHR.responseText);
              var message = response ? response.error.message.value : textStatus;
              alert("Call failed. Error: " + message);
          });
        }
      });
    });
  this.getListsInfo();
  }

 

  private getListsInfo() 
  {
    URLPATH=this.context.pageContext.web.absoluteUrl; 
    //alert("coming here");
    let html: string = '';
    if (Environment.type === EnvironmentType.Local)
     {
      var message=$('#dataHere');
      message.append("Sorry this does not work in local workbench");
      } else 
      { 
      var call = jQuery.ajax(
        {
            url: this.context.pageContext.web.absoluteUrl + `/_api/web/Lists/GetByTitle('Information')/items?$select=Title,URL,ID&$top=5&$orderby=Modified desc`,
            type: "GET",
            dataType: "json",
            headers: 
            {
                Accept: "application/json;odata=verbose"
            }
        });
        call.done(function (data, textStatus, jqXHR) {
            var SliderItems = jQuery("#Slider");
            var TestingItem=jQuery("#dataHere");
            var Count=0;
            $.each(data.d.results,function(val,value)
            {
                if(Count==0)
              {
                SliderItems.append(`
                <div class="item active">
                <img src="${value.URL}" alt="..." style="width:100%">
                <div class="carousel-caption">
                <h3>${value.Title}</h3>
                <button type="button" class="btn btn-light" data-toggle="modal" data-target="#myModal" id="${value.ID}">More</button>
                </div>
              </div>

                `);
                Count++;
              }
              else
              {
                  SliderItems.append(`
                  <div class="item">
                  <img src="${value.URL}" alt="..." style="width:100%">
                  <div class="carousel-caption">
                  <h3>${value.Title}</h3>
                  <button type="button" class="btn btn-light" data-toggle="modal" data-target="#myModal" id="${value.ID}">More</button>
                  </div>
                </div>
                  `);
              }



              //alert(element.URL);
              //SliderItems.append("<h1>"+element.Title+"</h1>");
              //SliderItems.append("<div class=\"item\"> <h1>"+element.Title+"</h1> <img width=\"100%\"  src="+element.URL+"></div>");
             //TestingItem.append("<img width=\"100\" src="+element.URL+">");
            });
        });
        call.fail(function (jqXHR, textStatus, errorThrown) {
            var response = JSON.parse(jqXHR.responseText);
            var message = response ? response.error.message.value : textStatus;
            alert("Call failed. Error: " + message);
        });
    
    }
  }


  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

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
