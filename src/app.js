const path = require('path')
const readline = require('readline')

const ref = require('ref-napi')
const ArrayType = require('ref-array-napi')
const Struct = require('ref-struct-di')(ref)
const ffi = require('ffi-napi')

var PagSeguro

var TransactionResult = Struct({
  rawBuffer: ArrayType('char *', 65543),
  message: ArrayType('char *', 1024),
  transactionCode: ArrayType('char *', 33),
  date: ArrayType('char *', 11),
  time: ArrayType('char *', 9),
  hostNsu: ArrayType('char *', 13),
  cardBrand: ArrayType('char *', 31),
  bin: ArrayType('char *', 7),
  holder: ArrayType('char *', 5),
  userReference: ArrayType('char *', 11),
  terminalSerialNumber: ArrayType('char *', 66),
})

function loadLibraries() {
  const dllPagSeguro = path.resolve(__dirname, '..', 'bin', 'PPPagSeguro.dll')
  const dllBTSerial = path.resolve(__dirname, '..', 'bin', 'BTSerial.dll')
  //const dllPlugPag = path.resolve(__dirname, '..', 'bin', 'PlugPag.dll')
  ffi.Library(dllBTSerial)
  return dllPagSeguro
}

const bluetooth_port = 'COM3'
const app_name = 'PlugPagNode'
const app_version = '1.0.0'

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function renderErr(codResponse) {
  const urlPagSeguro =
    'https://dev.pagseguro.uol.com.br/reference/plugpag-windows#listagem-de-erros'
  switch (codResponse) {
    case 0:
      break
    default:
      console.log(`Verificar a tabela de erros ${codResponse} ${urlPagSeguro}`)
      break
  }
}

//PAGAMENTO
function handlePayment() {
  console.log('Aguardando pagamento...')
}

//ULTIMO PAGAMENTO
function handleQueryLastTransaction() {
  console.log('Consultando ultima transacao...')

  TransactionResult.defineProperty('transactionResult', 
  ArrayType(ref.refType(TransactionResult)))

  const CPtr = ref.refType(TransactionResult);

  let response = PagSeguro.GetLastApprovedTransactionStatus(TransactionResult)
  

  try {
    if (response === 0) {
      console.log('response', response)
      console.log('transactionResultPtr', struct_sockaddr_in)
    } else {
      renderErr(response)
    }
  } catch (error) {
    console.log('error', error)
  }
}

function main() {
  dllPagSeguro = loadLibraries()
  PagSeguro = ffi.Library(dllPagSeguro, {
    GetLastApprovedTransactionStatus: ['int', [TransactionResult]],
    GetVersionLib: ['int', []],
    SetVersionName: ['int', ['string', 'string']],
    InitBTConnection: ['int', ['string']],
    SimplePaymentTransaction: ['int', ['int', 'int', 'int', 'string', 'string', TransactionResult]],
    CancelTransaction: ['int', [TransactionResult]], 
    UnloadDriverConnection: ['void', ['void']],
  })
  console.log('\n')
  console.log('Definindo nome e versão da aplicação... ')
  PagSeguro.SetVersionName(app_name, app_version)
  PagSeguro.InitBTConnection(bluetooth_port)
  console.log('\n\n*** Pressione Ctrl+C para finalizar a aplicação ***')
  var leitor = function () {
    rl.question(
      `1 - Pagar \n2 - Entornar (cancelar pagamento) \n3 - Consultar ultima transacao \n4 - Versão \n`,
      function (comando) {
        switch (comando) {
          case '1':
            handlePayment()
            break
          case '2':
            console.log('222222222222222')
            break
          case '3':
            handleQueryLastTransaction()
            break
          case '4':
            //VERSÃO
            console.log('Recuperando Versão...')
            let responseVersion = PagSeguro.GetVersionLib()
            console.log(`Versão ${responseVersion}`)
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

console.log(`Aplicação de demonstração da biblioteca PlugPag com integração para Node rodando no sistema
operation Windows.
Testado no Windows 10, com Node 14.17.2`)
main()
