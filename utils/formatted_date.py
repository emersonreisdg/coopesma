def formatted_date(data):
    print('ESTOU AQUI')
    return data.strftime('%d de %B de %Y') if data else 'No Date'
