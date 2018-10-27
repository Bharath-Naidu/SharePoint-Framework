import { Version, Environment, EnvironmentType } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneDropdown
  
} from '@microsoft/sp-webpart-base';
import * as $ from 'jquery';
import { escape } from '@microsoft/sp-lodash-subset';
 import Des from './descriptionString';
import styles from './MyFirstApplictionWebPart.module.scss';
import * as strings from 'MyFirstApplictionWebPartStrings';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
// export interface IMyFirstApplictionWebPartProps 
// {
//    description: string;
//  }


export default class MyFirstApplictionWebPart extends BaseClientSideWebPart<Des> {

  public render(): void {
    this.domElement.innerHTML = `
      <div class="${ styles.myFirstAppliction }">
        <div class="${ styles.container }">
          <div class="${ styles.row }" style="background-color:${this.properties.color}">
            <div class="${ styles.column }">
            <!--<span class="${ styles.title }">Welcome to SharePoint!</span>
              <p class="${ styles.subTitle }">Customize SharePoint experiences using Web Parts.</p>
              <p class="${ styles.description }">${escape(this.properties.description)}</p>
              Name:<input type="text" id="name"><br><br>
              Gender:<select id="Gender">
                <option value="Male">Male</option>
                <option value="Female">Female</option></select><br><br>-->
              All Types:<select id="AllCategoryTypes"></select><br><br>
              <table id="AllItems"></table>
              &nbsp;<!--<button type="button" onclick="${this.savedata}">Save</button><br>
              <a href="https://aka.ms/spfx" class="${styles.button}">
                <span class="${ styles.label }">Learn more</span>
              </a>-->
            </div>
          </div>
        </div>
        <div id="lists"></div>
      </div>`;
      this.Changed();
      this.getListsInfo();
     // this._setButtonEventHandlers(); 
  }
  public Changed()
  {
    // $("#AllCategoryTypes").change(function() {
    //   CategoriesChanged()   
    // });
    //alert("changed");
    this.domElement.querySelector("#AllCategoryTypes").addEventListener('change',()=>this.CategoriesChanged());
    //var sele=document.getElementById("AllCategoryTypes");
      //alert(document.getElementById('#AllCategoryTypes').nodeValue);
  }

  CategoriesChanged()
  {
    
     //var SelectedValue=(<HTMLSelectElement>this.domElement.querySelector("#AllCategoryTypes")).value;
     var SelectedValue=$("#AllCategoryTypes").val();
     let html: string = '';
  if (Environment.type === EnvironmentType.Local) {
    var message=$('#lists');
    message.append("Sorry this does not work in local workbench");
    //this.domElement.querySelector('#lists').innerHTML = "Sorry this does not work in local workbench";
  } else 
  {
  // this.context.spHttpClient.get
  // (
  //   this.context.pageContext.web.absoluteUrl + `/_api/web/Lists/GetByTitle('ProductName')/items?$select=Title,ID&$filter=CategoryLookup/Title eq '${SelectedValue}'`,
  //   SPHttpClient.configurations.v1)
  //   .then((response: SPHttpClientResponse) => {
  //     response.json().then((listsObjects: any) => {
  //       listsObjects.value.forEach(listObject => {
  //         html+=`<tr><td>${listObject.Title}</td></tr>`;
  //       });
  //       this.domElement.querySelector('#AllItems').innerHTML = html;
  //     });
  //   });  
  
  var call = jQuery.ajax(
    {
        url:this.context.pageContext.web.absoluteUrl + `/_api/web/Lists/GetByTitle('ProductName')/items?$select=Title,ID&$filter=CategoryLookup/Title eq '${SelectedValue}'`,
        type: "GET",
        dataType: "json",
        headers: 
        {
            Accept: "application/json;odata=verbose"
        }
    });
    call.done(function (data, textStatus, jqXHR) {
        jQuery('#AllItems tr').remove();
        var message = jQuery('#AllItems');
        $.each(data.d.results,function(val,element){
          message.append("<tr><td>"+element.Title+"</td></tr>");
        });
    });
    call.fail(function (jqXHR, textStatus, errorThrown) {
        var response = JSON.parse(jqXHR.responseText);
        var message = response ? response.error.message.value : textStatus;
        alert("Call failed. Error: " + message);
    });


  
    }
  }


//   private _setButtonEventHandlers(): void {
//     const webPart: SpfxCrudWebPart = this;
//     this.domElement.querySelector('#btnReadAllItems').addEventListener('click', () => {
//        this.savedata();
//     });
//  }
private getListsInfo() {
  let html: string = '';
  if (Environment.type === EnvironmentType.Local)
   {
    var message=$('#lists');
    message.append("Sorry this does not work in local workbench");
    //this.domElement.querySelector('#lists').innerHTML = "Sorry this does not work in local workbench";
    } else {
    //--------------------------------wroking fine but using jquery---------------------------
  // this.context.spHttpClient.get
  // (
    // //this.context.pageContext.web.absoluteUrl + `/_api/web/lists?$filter=Hidden eq false`, 
    // this.context.pageContext.web.absoluteUrl + `/_api/web/Lists/GetByTitle('Categoryname')/items?$select=Title,ID`,
    // SPHttpClient.configurations.v1)
    // .then((response: SPHttpClientResponse) => {
    //   response.json().then((listsObjects: any) => {
    //     listsObjects.value.forEach(listObject => {
    //       //  html += `<ul>
    //       //              <li>
    //       //                  <span class="ms-font-l">${listObject.Title}</span>
    //       //              </li>
    //       //          </ul>`;
    //       html+=`<option value="${listObject.Title}">${listObject.Title}</option>`;
    //      // html=listObject.Title;
    //     });
    //   
    //     this.domElement.querySelector('#AllCategoryTypes').innerHTML = html;
    //   });
    // });        
    var call = jQuery.ajax(
      {
          url: this.context.pageContext.web.absoluteUrl + `/_api/web/Lists/GetByTitle('Categoryname')/items?$select=Title,ID`,
          type: "GET",
          dataType: "json",
          headers: 
          {
              Accept: "application/json;odata=verbose"
          }
      });
      call.done(function (data, textStatus, jqXHR) {
          var DropDownListItems = jQuery("#AllCategoryTypes");
          $.each(data.d.results,function(val,element){
            DropDownListItems.append("<option value="+element.Title+">"+element.Title+"</option>");
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

  private savedata():void
  {
      
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
                }),
                PropertyPaneDropdown('color',{  
                  label: "Select Item",
                  options:[
                    {key:'red', text:'Red'},
                    {key:'blue', text:'Blue'},
                    {key:'green', text:'Green'}
                  ]
                }) 
              ]
            }
          ]
        }
      ]
    };
  }
}
