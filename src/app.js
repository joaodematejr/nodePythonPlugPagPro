const path = require('path')
const readline = require('readline')
const { PythonShell } = require('python-shell')

const pagSeguroPy = path.resolve(__dirname, '..', 'python', 'pagSeguro.py')

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const data = {
  APP_NAME: 'PlugPagPython',
  APP_VERSION: '1.0.0',
  BLUETOOTH_PORT: 'COM3',
  ENCODING: 'utf-8',
}

//PAGAMENTO
function handleSimplePaymentTransaction() {
  const payment = {
    METHOD: 1,
    INSTALLMENTS: 1,
    INSTALLMENT: 1,
    USERREF: 'UserRef',
  }
  let options = {
    args: ['SimplePaymentTransaction', JSON.stringify(data), JSON.stringify(payment)],
  }
  PythonShell.run(pagSeguroPy, options, (err, results) => {
    if (err) {
      console.log('err', err)
    } else {
      console.log(results)
    }
  })
}

//Consulta da Ultima Transacao
function handleQueryLastTransaction() {
  let options = {
    args: ['GetLastApprovedTransactionStatus', JSON.stringify(data), JSON.stringify({})],
  }
  PythonShell.run(pagSeguroPy, options, (err, results) => {
    if (err) {
      console.log('err', err)
    } else {
      console.log(results)
    }
  })
}

function handleVersion() {
  let options = {
    args: ['GetVersionLib', JSON.stringify(data), JSON.stringify({})],
  }
  PythonShell.run(pagSeguroPy, options, (err, results) => {
    if (err) {
      console.log('err', err)
    } else {
      console.log('results', results)
    }
  })
}

function main() {
  console.log('\n\n*** Pressione Ctrl+C para finalizar a aplicação ***')
  var leitor = function () {
    rl.question(
      `1 - Pagar \n2 - Entornar (cancelar pagamento) \n3 - Consultar ultima transacao \n4 - Versão \n`,
      function (comando) {
        switch (comando) {
          case '1':
            handleSimplePaymentTransaction()
            break
          case '2':
            console.log("Erro")
            break
          case '3':
            handleQueryLastTransaction()
            break
          case '4':
            handleVersion()
            break
          default:
            break
        }
        leitor()
      },
    )
  }
  leitor()
}

console.log(`Aplicação de demonstração da biblioteca PlugPag com integração para Node e Python rodando no sistema
operation Windows.
Testado no Windows 10, com Node e Python 14.17.2`)
main()
