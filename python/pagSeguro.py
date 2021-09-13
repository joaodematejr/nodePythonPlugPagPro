# -*- coding: cp1252 -*-
#-*- coding: UTF-8 -*-
# coding: iso-8859-1 -*-

import sys
import ctypes
import json

ENCODING = 'utf-8'

class TransactionResult(ctypes.Structure):
    _fields_ = [('rawBuffer', ctypes.ARRAY(65543, ctypes.c_char)),
                ('message', ctypes.ARRAY(1024, ctypes.c_char)),
                ('transactionCode', ctypes.ARRAY(33, ctypes.c_char)),
                ('date', ctypes.ARRAY(11, ctypes.c_char)),
                ('time', ctypes.ARRAY(9, ctypes.c_char)),
                ('hostNsu', ctypes.ARRAY(13, ctypes.c_char)),
                ('cardBrand', ctypes.ARRAY(31, ctypes.c_char)),
                ('bin', ctypes.ARRAY(7, ctypes.c_char)),
                ('holder', ctypes.ARRAY(5, ctypes.c_char)),
                ('userReference', ctypes.ARRAY(11, ctypes.c_char)),
                ('terminalSerialNumber', ctypes.ARRAY(66, ctypes.c_char))]


def loadLibraries():
    ppLib = ctypes.cdll.LoadLibrary('bin/PPPagSeguro.dll')
    ctypes.cdll.LoadLibrary('bin/BTSerial.dll')
    ctypes.cdll.LoadLibrary('bin/PlugPag.dll')
    return ppLib

def printResult(resultCode, transactionResult):
    if resultCode.value != 0:
        struct = { 
            'resultCode': resultCode.value,
        }
        print(json.dumps(struct))
    if len(transactionResult.message) > 0:
        struct = { 
            'resultCode': resultCode.value,
            "message": transactionResult.message.decode("unicode_escape"), 
        }
        print(json.dumps(struct))
    if resultCode.value == 0:
        struct = {
            'response': resultCode.value,
            "message": transactionResult.message.decode(ENCODING),
            "transactionCode": transactionResult.transactionCode.decode(ENCODING),
            "date": transactionResult.date.decode(ENCODING),
            "time": transactionResult.time.decode(ENCODING),
            "hostNsu": transactionResult.hostNsu.decode(ENCODING),
            "cardBrand": transactionResult.cardBrand.decode(ENCODING),
            "bin": transactionResult.bin.decode(ENCODING),
            "holder": transactionResult.holder.decode(ENCODING),
            "userReference": transactionResult.userReference.decode(ENCODING),
            "terminalSerialNumber": transactionResult.terminalSerialNumber.decode(ENCODING),
        }
        print(json.dumps(struct))
    else:
        print('Opção Invalida')



def initPlugPag(pagSeguroLib, infoString):
    info = json.loads(infoString)
    APP_NAME = (b"" + str(info["APP_NAME"]).encode('ascii') + b"")
    APP_VERSION = (b"" + str(info["APP_VERSION"]).encode('ascii') + b"")
    BLUETOOTH_PORT = (b"" + str(info["BLUETOOTH_PORT"]).encode('ascii') + b"")
    print('Definindo nome e versão da aplicação... ', end='')
    pagSeguroLib.SetVersionName(APP_NAME, APP_VERSION)
    print('OK')
    print('Configurando conexão bluetooth... ', end='')
    pagSeguroLib.InitBTConnection(BLUETOOTH_PORT)
    print('OK')

def SimplePaymentTransaction(pagSeguroLib, infoPayment):
    payment = json.loads(infoPayment)
    transactionResult = TransactionResult()
    USERREF = (b"" + str(payment["USERREF"]).encode('ascii') + b"")
    resultCode = ctypes.c_int(pagSeguroLib.SimplePaymentTransaction(1, 1, 1, bytes('100', ENCODING), USERREF, ctypes.byref(transactionResult)))
    printResult(resultCode, transactionResult)


def GetVersionLib(pagSeguroLib):
    version = ctypes.c_int(pagSeguroLib.GetVersionLib())
    print(version.value)
        

def GetLastApprovedTransactionStatus(pagSeguroLib):
    transactionResult = TransactionResult()
    resultCode = ctypes.c_int(pagSeguroLib.GetLastApprovedTransactionStatus(ctypes.byref(transactionResult)))
    printResult(resultCode, transactionResult)
    

def PagSeguro(params, info, infoPayment):
    dllPagSeguro = loadLibraries()
    initPlugPag(dllPagSeguro, info)
    if params == 'GetVersionLib':
        GetVersionLib(dllPagSeguro)
    elif params == 'SimplePaymentTransaction':
        SimplePaymentTransaction(dllPagSeguro, infoPayment)
    elif params == 'CancelTransaction':
        print('CancelTransaction')
    elif params == 'GetLastApprovedTransactionStatus':
        GetLastApprovedTransactionStatus(dllPagSeguro)
    else:
        print('Opção Invalida')


funcao = sys.argv[1]
info = sys.argv[2]
infoPayment = sys.argv[3]
PagSeguro(funcao, info, infoPayment)