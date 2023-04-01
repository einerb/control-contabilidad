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
  public expenses = 0;
  public balance = 0;
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
  filteredData: any;

  constructor(private fb: FormBuilder) {
    this.createForm();
  }

  ngOnInit(): void {
    this.getTotal();
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

    this.getTotal();
    this.getExpenses();

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
      this.dataLocal = newDataLocal;
    }
  }

  public formatMoney(value: number) {
    return new Intl.NumberFormat('es-CL').format(value);
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

        this.getTotal();
      }
    });
  }

  public save(amount: any) {
    localStorage.setItem('amount', JSON.stringify(+amount.value));

    this.getTotal();

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
      }
    }

    this.getTotal();
  }

  private createForm() {
    this.expenseId = this.getExpenseId();
    this.form = this.fb.group({
      description: ['', [Validators.required]],
      amount: ['', [Validators.required]],
    });
  }

  private getExpenses() {
    let expenses = localStorage.getItem('dataExpenses');

    if (expenses) {
      const allExpenses = JSON.parse(expenses);

      const todayExpenses = allExpenses.filter((expense: Expense) => {
        const createdAt = moment(expense.createdAt, 'DD/MM/YYYY').month() + 1;

        return createdAt === moment(new Date(), 'DD/MM/YYYY').month() + 1;
      });

      this.dataLocal = todayExpenses;
    }
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

  private getTotal() {
    this.expenses = 0;
    this.getExpenses();

    this.dataLocal.forEach((element: any) => {
      if (!element.state) {
        this.expenses += element.amount;
      }
    });

    let amountLocal = localStorage.getItem('amount');
    if (amountLocal) {
      this.earnings = parseInt(amountLocal);
    }

    this.balance = Math.abs(this.earnings) - Math.abs(this.expenses);
  }
}
