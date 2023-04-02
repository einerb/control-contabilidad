import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import * as moment from 'moment';

export interface Expense {
  id: string;
  description: string;
  amount: number;
  createdAt: string;
  state: boolean;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  @ViewChild('closeModalEdit') closeModalEdit!: ElementRef;
  @ViewChild('closeModalCreate') closeModalCreate!: ElementRef;

  public year = new Date().getFullYear();
  public month = new Date().toLocaleString('default', { month: 'long' });
  public earnings: any = '0';
  public expenseId = '';
  public months: string[] = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];
  public dataLocal: any = [];
  public form!: FormGroup;
  public selectedMonth = moment(new Date(), 'DD/MM/YYYY').month() + 1;

  /* Pagination */
  public MAX_ITEMS_PER_PAGE = 100;
  public page: number = 1;
  public totalPages = 0;
  public numberPages: any = 0;
  public isVisiblePagination = true;

  constructor(private fb: FormBuilder) {
    this.createForm();
  }

  ngOnInit(): void {
    this.getExpenses(this.page);
  }

  get getPaid(): number {
    let countPay = 0;
    this.dataLocal.forEach((element: any) => {
      if (element.state) {
        countPay++;
      }
    });

    return countPay;
  }

  get getNoPaid(): number {
    let countPay = 0;
    this.dataLocal.forEach((element: any) => {
      if (!element.state) {
        countPay++;
      }
    });

    return countPay;
  }

  get getExpense(): number {
    let expense = 0;
    let expenses = localStorage.getItem('dataExpenses');

    if (expenses) {
      const allExpenses = JSON.parse(expenses);
      allExpenses.forEach((element: any) => {
        if (!element.state) {
          expense += element.amount;
        }
      });
    }

    return expense;
  }

  get getBalance(): number {
    let balance = 0;
    let expenses = localStorage.getItem('dataExpenses');

    if (expenses) {
      balance = Math.abs(this.getEarning) - Math.abs(this.getExpense);
    }

    return balance;
  }

  get getEarning(): number {
    let amountLocal = localStorage.getItem('amount');
    if (amountLocal) {
      this.earnings = parseInt(amountLocal);
    }

    return this.earnings;
  }

  public createExpense() {
    if (this.form.invalid) {
      return;
    }

    let arrayLocal;
    const localStorageData = localStorage.getItem('dataExpenses');

    const date = new Date();
    const options: any = { day: '2-digit', month: '2-digit', year: 'numeric' };
    const dateFormatted = date.toLocaleDateString('es-ES', options);

    this.expenseId = this.getExpenseId();

    const data: Expense = {
      id: this.expenseId,
      description: this.form.get('description')?.value,
      amount: this.form.get('amount')?.value,
      createdAt: dateFormatted,
      state: false,
    };

    localStorageData
      ? (arrayLocal = JSON.parse(localStorageData))
      : (arrayLocal = []);

    arrayLocal.push(data);
    localStorage.setItem('dataExpenses', JSON.stringify(arrayLocal));

    this.getExpenses(this.page);

    this.form.reset();
    this.closeModalCreate.nativeElement.click();
  }

  public filterExpenses() {
    let expenses = localStorage.getItem('dataExpenses');

    if (expenses) {
      const allExpenses = JSON.parse(expenses);

      const filteredExpenses = allExpenses.filter((expense: Expense) => {
        const dateRecord = moment(expense.createdAt, 'DD/MM/YYYY').month() + 1;
        return dateRecord === +this.selectedMonth;
      });
      const newDataLocal = filteredExpenses;

      this.page = 1;

      const startIndex = (this.page - 1) * this.MAX_ITEMS_PER_PAGE;
      const endIndex = startIndex + this.MAX_ITEMS_PER_PAGE;

      this.dataLocal = newDataLocal.slice(startIndex, endIndex);

      this.isVisiblePagination =
        newDataLocal.length > this.MAX_ITEMS_PER_PAGE ? true : false;
    }
  }

  public formatMoney(value: number) {
    return new Intl.NumberFormat('es-CL').format(value);
  }

  public getExpenses(page: number) {
    let expenses = localStorage.getItem('dataExpenses');

    if (expenses) {
      const allExpenses = JSON.parse(expenses);

      const todayExpenses = allExpenses.filter((expense: Expense) => {
        const createdAt = moment(expense.createdAt, 'DD/MM/YYYY').month() + 1;

        return createdAt === moment(new Date(), 'DD/MM/YYYY').month() + 1;
      });

      const startIndex = (page - 1) * this.MAX_ITEMS_PER_PAGE;
      const endIndex = startIndex + this.MAX_ITEMS_PER_PAGE;

      this.dataLocal = todayExpenses.slice(startIndex, endIndex);
      this.totalPages = Math.ceil(
        todayExpenses.length / this.MAX_ITEMS_PER_PAGE
      );

      this.numberPages = Array.from(
        { length: this.totalPages },
        (_, i) => i + 1
      );
    }
  }

  public nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.getExpenses(this.page);
    }
  }

  public previousPage() {
    if (this.page > 1) {
      this.page--;
      this.getExpenses(this.page);
    }
  }

  public remove(expense: number) {
    Swal.fire({
      title: 'Está seguro?',
      text: 'El registro será eliminado permanentemente',
      icon: 'warning',
      showCancelButton: true,
      cancelButtonColor: '#3085d6',
      confirmButtonColor: '#d33',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result: any) => {
      if (result.isConfirmed) {
        const itemsString = localStorage.getItem('dataExpenses');
        if (itemsString) {
          const items = JSON.parse(itemsString);

          const itemToDelete = items.find((item: any) => item.id === expense);
          if (itemToDelete) {
            const indexToRemove = items.indexOf(itemToDelete);
            items.splice(indexToRemove, 1);

            localStorage.setItem('dataExpenses', JSON.stringify(items));
          }
        }

        Swal.fire(
          'Eliminado!',
          'El registro del gasto fue eliminado exitosamente!',
          'success'
        );

        if (this.dataLocal.length === 1) {
          this.getExpenses(this.page--);
        }

        this.getExpenses(this.page);
      }
    });
  }

  public save(amount: any) {
    localStorage.setItem('amount', JSON.stringify(+amount.value));

    this.closeModalEdit.nativeElement.click();

    amount.value = '';
  }

  public updatePay(expense: number) {
    const itemsString = localStorage.getItem('dataExpenses');
    if (itemsString) {
      const items = JSON.parse(itemsString);

      const itemToUpdate = items.find((item: any) => item.id === expense);
      if (itemToUpdate) {
        itemToUpdate.state = true;

        localStorage.setItem('dataExpenses', JSON.stringify(items));

        this.getExpenses(this.page);
      }
    }
  }

  private createForm() {
    this.expenseId = this.getExpenseId();
    this.form = this.fb.group({
      description: ['', [Validators.required]],
      amount: ['', [Validators.required]],
    });
  }

  private getExpenseId() {
    const localStorageData = localStorage.getItem('dataExpenses');
    let consecutive;
    if (localStorageData) {
      consecutive = JSON.parse(localStorageData).length + 1;
    } else {
      consecutive = 1;
    }

    return consecutive < 1000 && consecutive < 10
      ? 'GST-000' + consecutive
      : 'GST-00' + consecutive;
  }
}
