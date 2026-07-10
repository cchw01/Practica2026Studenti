using System.Text.Json.Serialization;

namespace Backend.UserSpace
{
    public class User
    {
        // 1. ID
        public string id { get; set; }

        // 2. UserName
        public string userName { get; set; }

        // 3. Name
        public string name { get; set; }

        // 4. Email
        public string email { get; set; }

        // 5. Role
        public Enum roleEnum { get; set; }

        // 6. Password - hashed, folosit doar in DB, nu trebuie expus catre UI/API
        [JsonIgnore]
        //public string Password { get; set; }

       // 7. Lista de item-uri 
        public string addedItemsList { get; set; }

        // 8. Lista de item-uri pe care userul a licitat
        public string biddedItemsList { get; set; }

        // 9. Wishlist
        public string whishList { get; set; }

        // 10. Rating - doar pentru UI, calculat din ReviewList, fara setter public
        public float rating { get; private set; }

        // 11. Lista de review-uri primite de user
        public string reviewList { get; set; }



        public User(string Id, string UserName, string Name, string Email, Enum RoleEnum)
        {
            id = Id;
            userName = UserName;
            name = Name;
            email = Email;
            roleEnum = RoleEnum;
            
        }
    }
}





    

