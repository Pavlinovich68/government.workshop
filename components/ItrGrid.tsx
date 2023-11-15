import {DataTable, DataTableSortMeta, DataTableStateEvent} from "primereact/datatable";
import gridTools from "../services/gridTools";
import React, {forwardRef, Ref, useEffect, useImperativeHandle, useState} from "react";
import {IDataSourceResult} from "../types/IDataSourceResult";
import {Paginator} from "primereact/paginator";
import {Dropdown} from "primereact/dropdown";
import {Button} from "primereact/button";
import {InputText} from "primereact/inputtext";
import {Toolbar} from "primereact/toolbar";
import {Column} from "primereact/column";
import {confirmDialog} from "primereact/confirmdialog";
import { IGridRef } from "../types/IGridRef";
import {InputSwitch} from "primereact/inputswitch";

const ItrGrid = ({
   id,
   create,
   read,
   update,
   drop,
   columnFields,
   tableStyle,
   columns,
   showClosed,
   headerColumnGroup} : any,
   ref: Ref<IGridRef>) => {

   const [orderBy, setOrderBy] = useState({});
   const [sort, setSort] = useState<DataTableSortMeta[]>([]);
   const [filter, setFilter] = useState('');
   const [pageSize, setPageSize] = useState(10);
   const [pageNo, setPageNo] = useState(1);
   const [recordCount, setRecordCount] = useState(0);
   const [records, setRecords] = useState<any>([]);
   const [allRecords, setAllRecords] = useState<boolean>(false);


   useEffect(() => {
      fetchData(false, 10, 1, orderBy).then((data)=>{
         if (data.status === 200){
            setPageNo(1);
            setPageSize(data.pageSize);
            setRecordCount(data.recordCount)
            setRecords(data.result);
         }
      });
      gridTools.cleanOrders(id);
   }, []);
   const fetchData = async (all: boolean, size: number, no: number, order: any, filterValue: string = filter): Promise<IDataSourceResult> => {
      try {
         const { data, status } = await read(all, size, no, order, filterValue);
         data.status = status;
         return data;
      } catch (e: any){
         console.log(e);
         return {
            status: e.request.status,
            recordCount: 0,
            pageCount: 0,
            pageNo: 0,
            pageSize: 0,
            result: []
         }
      }
   }

   const onShowAll = (all: boolean) => {
      setAllRecords(all);
      fetchData(all, pageSize, pageNo, orderBy).then((data)=>{
         if (data.status === 200) {
            setRecordCount(data.recordCount)
            setRecords(data.result);
         }
      });
   }

   const reload = () => {
      fetchData(allRecords, pageSize, pageNo, orderBy).then((data)=>{
         if (data.status === 200) {
               setRecordCount(data.recordCount)
               setRecords(data.result);
         }
      });
   };

   useImperativeHandle(ref, () => ({reload}));
   const onSort = (event: DataTableStateEvent) => {
      if (event.multiSortMeta?.length === 0){
         return;
      }

      let sortMeta = event.multiSortMeta ?? [];

      let columnSort = sort.find(i => i.field === sortMeta[0].field);

      const prevSort = sort;
      if (!columnSort){
         prevSort.push(sortMeta[0]);
      } else {
         switch (columnSort.order){
            case 1: {
               columnSort.order = -1;
               break;
            }
            case 0: {
               columnSort.order = 1;
               break;
            }
            case -1: {
               const index = prevSort.indexOf(columnSort);
               if (index > -1){
                  prevSort.splice(index, 1);
               }
               break;
            }
         }
      }
      setSort(prevSort);
      let _orderBy: any[] = [];
      sort.forEach((item)=>{
         const words = item.field.split('.');
            let str = '{';
            if (item.order !== 0) {
               for (let i = 0; i < words.length; i++){
                  if (i < words.length-1){
                     str = `${str}"${words[i]}": {`
                  } else {
                     str = `${str}"${words[i]}": "${item.order === 1 ? 'asc' : 'desc'}"`
                  }
               }
               for (let i = 0; i < words.length-1; i++){
                  str = `${str}}`
               }
            }
            str += '}';
            _orderBy.push(JSON.parse(str));
      });
      setOrderBy(_orderBy);
      fetchData(allRecords, pageSize, 1, _orderBy).then((data)=>{
         if (data.status === 200){
            setPageNo(1);
            setPageSize(data.pageSize);
            setRecordCount(data.recordCount)
            setRecords(data.result);
         }
      });
      gridTools.sortOrders(id, columnFields, prevSort);
   }

   const onRefreshCurrentPage = (event: any) => {
      fetchData(allRecords, pageSize, pageNo, orderBy).then((data)=>{
         if (data.status === 200) {
            setRecordCount(data.recordCount)
            setRecords(data.result);
         }
      });
   };

   const paginatorTemplate = {
      layout: 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport',
      RowsPerPageDropdown: (options: any) => {
         const dropdownOptions = [
            { label: 5, value: 5 },
            { label: 10, value: 10 },
            { label: 20, value: 20 },
            { label: 120, value: 120 }
         ];

         return (
            <React.Fragment>
               <span className="mx-1" style={{ color: 'var(--text-color)', userSelect: 'none' }}>
                  Строк на странице:{' '}
               </span>
               <Dropdown value={options.value} options={dropdownOptions} onChange={options.onChange} />
            </React.Fragment>
         );
      },
      CurrentPageReport: (options: any) => {
         return (
            <React.Fragment>
               <span style={{ color: 'var(--text-color)', userSelect: 'none', width: '120px', textAlign: 'center' }}>
                  {options.first} - {options.last} из {options.totalRecords}
               </span>
               <Button type="button" icon="pi pi-refresh" text onClick={onRefreshCurrentPage}/>
            </React.Fragment>
         );
      }
   };
   const onPageChange = (event: any) => {
      setPageNo(event.first);
      setPageSize(event.rows);
      fetchData(allRecords, event.rows, event.page +1, orderBy).then((data)=>{
         if (data.status === 200) {
            setRecordCount(data.recordCount)
            setRecords(data.result);
         }
      });
   };

   const paginator =  <Paginator template={paginatorTemplate} first={pageNo} rows={pageSize} totalRecords={recordCount} onPageChange={onPageChange} className="justify-content-end" />;

   const startContent = (
      <React.Fragment>
         <Button icon="pi pi-plus" rounded severity="success" aria-label="Bookmark"
            tooltip="Создать" tooltipOptions={{ position: 'top' }}
            onClick={() => create()}
         />
      </React.Fragment>
   );

   const onGlobalFilterChange = (e: any) => {
      const value = e.target.value;
      setFilter(value);
      fetchData(allRecords, pageSize, 1, orderBy, value).then((data)=>{
         if (data.status === 200) {
            setPageNo(1);
            setPageSize(data.pageSize);
            setRecordCount(data.recordCount);
            setRecords(data.result);
         }
      });
   };
   const endContent = (
      <React.Fragment>
         {showClosed ? (
            <div className="flex flex-column itr-switch">
               <label>Показать закрытые записи</label>
               <InputSwitch
                  checked={allRecords}
                  onChange={(e) => onShowAll(e.value ?? false)}
               />
            </div>
         ) : ''}
         <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText value={filter} onChange={onGlobalFilterChange} placeholder="Поиск" />
         </span>
      </React.Fragment>
   );
   const renderHeader = () => {
      return (
         <Toolbar start={startContent} end={endContent} />
      );
   };
   const header = renderHeader();

   const deleteRecord = async (id: any) => {
      await drop(id);
      fetchData(allRecords, pageSize, pageNo, orderBy).then((data)=>{
         if (data.status === 200) {
            setRecordCount(data.recordCount)
            setRecords(data.result);
         }
      });
   }

   const confirmDelete = (data: any) => {
      confirmDialog({
         message: `Вы уверены что хотите удалить запись?`,
         header: 'Удаление записи',
         icon: 'pi pi-exclamation-triangle text-red-500',
         acceptLabel: 'Да',
         rejectLabel: 'Нет',
         showHeader: true,
         accept: () => deleteRecord(data.id)
      });
   };

   const editRecordTemplate = (item: any) => {
      return <Button icon="pi pi-pencil" className="itr-row-button" rounded severity="info" aria-label="Редактировать"
               tooltip="Редактировать" tooltipOptions={{ position: 'top' }}
               onClick={() => update(item)}
      />
   }
   const deleteRecordTemplate = (item: any) => {
      return <Button icon="pi pi-trash" severity="danger" className="itr-row-button" rounded aria-label="Удалить"
               tooltip="Удалить" tooltipOptions={{ position: 'top' }}
               onClick={() => confirmDelete(item)}
      />
   }

   return <DataTable
      id={id}
      onSort={onSort}
      value={records}
      removableSort
      sortMode="multiple"
      showGridlines
      stripedRows
      tableStyle={tableStyle}
      footer={paginator}
      header={header}
      headerColumnGroup={headerColumnGroup}
   >
      <Column header="" body={editRecordTemplate} style={{ width: '1rem' }}/>
      {columns.map((item: any) => item)}
      <Column header="" body={deleteRecordTemplate}  style={{ width: '1rem' }}/>
   </DataTable>;
}

export default forwardRef(ItrGrid);