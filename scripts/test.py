import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client | None = None

if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    try:
        # Puxa no máximo 2 registros da sua tabela
        resposta = supabase.table('meta_ads_campanhas').select("*").limit(2).execute()
        
        print("🟢 Sucesso! Consegui acessar a tabela.")
        print("Dados retornados:")
        print(resposta.data)
        
    except Exception as e:
        print("🔴 Erro ao ler a tabela. Verifique se o nome está correto e se há dados nela.")
        print("Detalhes:", e)
else:
    print("Aviso: Variáveis do Supabase não encontradas!")